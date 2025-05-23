"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useVerifyEmail } from "@/hooks/actions"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { verifyEmailSchema } from "@/schema/auth"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useState } from "react"
import { Alert, AlertDescription, alertVariants } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VariantProps } from "class-variance-authority";

type Message = {
  variant: VariantProps<typeof alertVariants>['variant'];
  content: string;
} | null;

interface VerifyEmailFormProps {
  email?: string;
  code?: string;
  token?: string;
}

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

type Step = 'email' | 'verify'

export function VerifyEmailForm({ email, code, token }: VerifyEmailFormProps) {
  const t = useTranslations();
  const { execute: executeVerifyEmail, isPending } = useVerifyEmail()
  const [message, setMessage] = useState<Message>(null);
  
  // Determine initial step based on provided parameters
  const getInitialStep = (): Step => {
    if (email) return 'verify'
    return 'email'
  }
  
  const [step, setStep] = useState<Step>(getInitialStep());
  
  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email,
      code: email && code ? code : undefined
    }
  })

  const handleNextStep = async () => {
    const isValid = await form.trigger('email')
    if (!isValid) return
    setStep('verify')
  }

  const verifyEmail = async (data: VerifyEmailFormData) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("code", data.code)

    if (token) {
        formData.append("token", token)
    }
    
    try {
      const [response] = await executeVerifyEmail(formData)
      
      if (response?.success) {
        setMessage({ variant: "default", content: t('auth.verify-email.success') });
      } else {
        switch (response?.error) {
          case 'INVALID_CODE':
            setMessage({ variant: "destructive", content: t('auth.errors.invalid-code') });
            break;
          case 'CODE_EXPIRED':
            setMessage({ variant: "destructive", content: t('auth.errors.code-expired') });
            break;
          case 'CONTACT_ADMINISTRATOR':
            setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
            break;
        }
      }
    } catch {
      setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return t('auth.verify-email.enter-email')
      case 'verify':
        return code 
          ? t('auth.verify-email.ready-to-verify')
          : t('auth.verify-email.enter-code')
    }
  }

  const getButtonText = () => {
    if (isPending) return t('auth.verify-email.submitting')
    
    switch (step) {
      case 'email':
        return t('auth.verify-email.continue')
      case 'verify':
        return t('auth.verify-email.verify')
    }
  }

  const renderCodeInput = () => {
    if (email && code) return null;
    
    return (
      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium">
          {t('auth.fields.verification-code')}
        </label>
        <InputOTP
          maxLength={6}
          value={form.watch("code")}
          onChange={(value) => form.setValue("code", value)}
          aria-invalid={!!form.formState.errors.code}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {form.formState.errors.code && (
          <p className="text-sm text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Link href="/" className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Acme Inc.
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.verify-email.title')}</CardTitle>
          <CardDescription>
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('auth.fields.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder={t('auth.fields.email-placeholder')}
                  aria-invalid={!!form.formState.errors.email}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <Button 
                  type="button"
                  onClick={handleNextStep}
                  className="w-full" 
                  disabled={isPending}
                >
                  {getButtonText()}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/auth/sign-in" className="text-primary hover:underline">
                    {t('auth.verify-email.back-to-sign-in')}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(verifyEmail)} className="space-y-6">
              {message && (
                <Alert variant={message.variant}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.content}</AlertDescription>
                </Alert>
              )}
              {renderCodeInput()}
              <div className="space-y-4">
                <Button 
                  type="submit"
                  className="w-full" 
                  disabled={isPending}
                >
                  {getButtonText()}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/auth/sign-in" className="text-primary hover:underline">
                    {t('auth.verify-email.back-to-sign-in')}
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t.rich('auth.disclaimer', {
          terms: (chunks) => <Link href="/terms-of-service">{chunks}</Link>,
          privacy: (chunks) => <Link href="/privacy-policy">{chunks}</Link>
        })}
      </div>
    </div>
  )
} 