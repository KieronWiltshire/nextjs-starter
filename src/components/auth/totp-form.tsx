'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { GalleryVerticalEnd } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { totpSchema } from "@/schema/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSignIn, useInitChallengeFactor } from "@/hooks/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation";
import { useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription, alertVariants } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VariantProps } from "class-variance-authority";

type Message = {
  variant: VariantProps<typeof alertVariants>['variant'];
  content: string;
} | null;

type TOTPFormData = z.infer<typeof totpSchema>;

type MFAChallenge = {
  pendingAuthenticationToken: string;
  authenticationFactors: Array<{
    id: string;
    type: string;
  }>;
};

interface TOTPFormProps {
  mfaChallenge: MFAChallenge;
  onBack?: () => void;
}

export function TOTPForm({ 
  mfaChallenge,
  onBack 
}: TOTPFormProps) {
  const t = useTranslations();
  const { execute: executeLogin, isPending } = useSignIn();
  const { execute: executeInitChallenge, isPending: isInitiatingChallenge } = useInitChallengeFactor();
  const [message, setMessage] = useState<Message>(null);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);

  const form = useForm<TOTPFormData>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      pendingAuthenticationToken: mfaChallenge.pendingAuthenticationToken,
      authenticationChallengeId: challengeId || "",
      code: "",
    }
  });

  const initChallenge = useCallback(async (factorId: string) => {
    try {
      const formData = new FormData();
      formData.append("authenticationFactorId", factorId);
      
      const [response] = await executeInitChallenge(formData);
      
      if (response?.success && response.metadata?.challengeId) {
        setChallengeId(response.metadata.challengeId);
        setShowOtpInput(true);
        form.setValue("authenticationChallengeId", response.metadata.challengeId);
      } else {
        setMessage({ variant: "destructive", content: t('auth.totp-form.challenge-failed') });
      }
    } catch {
      setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
    }
  }, [executeInitChallenge, form, t]);

  // Auto-initiate challenge if only one factor exists
  useEffect(() => {
    if (mfaChallenge.authenticationFactors.length === 1 && !selectedFactor && !challengeId) {
      const singleFactor = mfaChallenge.authenticationFactors[0];
      setSelectedFactor(singleFactor.id);
      initChallenge(singleFactor.id);
    }
  }, [mfaChallenge.authenticationFactors, selectedFactor, challengeId, initChallenge]);

  const handleFactorSelection = (factorId: string) => {
    setSelectedFactor(factorId);
    initChallenge(factorId);
  };

  const verifyTOTP = async (data: TOTPFormData) => {
    if (!challengeId) {
      setMessage({ variant: "destructive", content: t('auth.totp-form.challenge-not-initiated') });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("code", data.code);
      formData.append("pendingAuthenticationToken", mfaChallenge.pendingAuthenticationToken);
      formData.append("authenticationChallengeId", challengeId);

      const [response] = await executeLogin(formData);
      
      if (response?.success) {
        setMessage({ variant: "default", content: t('auth.totp-form.success') });
      } else {
        switch (response?.error) {
          case 'INVALID_CREDENTIALS':
            setMessage({ variant: "destructive", content: t('auth.totp-form.invalid-code') });
            break;
          case 'CONTACT_ADMINISTRATOR':
            setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
            break;
          default:
            setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
            break;
        }
      }
    } catch {
      setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Link href="/" className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Acme Inc.
      </Link>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t('auth.totp-form.title')}</CardTitle>
            <CardDescription>
              {t('auth.totp-form.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {message && (
                <Alert variant={message.variant}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.content}</AlertDescription>
                </Alert>
              )}
              {/* Factor Selection - only show when multiple factors exist and no challenge initiated */}
              {mfaChallenge.authenticationFactors.length > 1 && !showOtpInput && (
                <div className="grid gap-3">
                  <FormLabel>{t('auth.totp-form.select-method')}</FormLabel>
                  {mfaChallenge.authenticationFactors.map((factor) => (
                    <Button
                      key={factor.id}
                      type="button"
                      variant={selectedFactor === factor.id ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleFactorSelection(factor.id)}
                      disabled={isInitiatingChallenge}
                    >
                      {factor.type === 'totp' 
                        ? t('auth.totp-form.authenticator-app')
                        : factor.type === 'sms'
                        ? t('auth.totp-form.sms')
                        : factor.type
                      }
                    </Button>
                  ))}
                </div>
              )}

              {/* OTP Input - only show after challenge is initiated */}
              {showOtpInput && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(verifyTOTP)} className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {selectedFactor && mfaChallenge.authenticationFactors.find(f => f.id === selectedFactor)?.type === 'totp'
                              ? t('auth.totp-form.code-label')
                              : selectedFactor && mfaChallenge.authenticationFactors.find(f => f.id === selectedFactor)?.type === 'sms'
                              ? t('auth.totp-form.sms-code-label')
                              : t('auth.totp-form.verification-code-label')
                            }
                          </FormLabel>
                          <FormControl>
                            <InputOTP
                              maxLength={6}
                              {...field}
                              className="w-full"
                            >
                              <InputOTPGroup className="w-full justify-center">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? t('auth.totp-form.submitting') : t('auth.totp-form.submit')}
                    </Button>
                  </form>
                </Form>
              )}

              {/* Loading state for challenge initiation */}
              {isInitiatingChallenge && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('auth.totp-form.initiating-challenge')}</p>
                </div>
              )}
              {onBack && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-sm underline underline-offset-4 hover:no-underline"
                  >
                    {t('auth.totp-form.back-to-sign-in')}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {t.rich('auth.disclaimer', {
            terms: (chunks) => <Link href="/terms-of-service">{chunks}</Link>,
            privacy: (chunks) => <Link href="/privacy-policy">{chunks}</Link>
          })}
        </div>
      </div>
    </div>
  );
}
