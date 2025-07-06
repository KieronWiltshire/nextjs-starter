'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEnd } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signUpSchema } from "@/schema/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSignUp, useSignUpOAuth } from "@/hooks/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ControllerRenderProps } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { Alert, AlertDescription, alertVariants } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VariantProps } from "class-variance-authority";

type Message = {
  variant: VariantProps<typeof alertVariants>['variant'];
  content: string;
} | null;

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const t = useTranslations();
  const { execute: executeSignUp, isPending } = useSignUp();
  const { execute: executeOAuth } = useSignUpOAuth();
  const [message, setMessage] = useState<Message>(null);
  
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  });

  const signUp = async (data: SignUpFormData) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      const [response] = await executeSignUp(formData);
      
      if (response?.success) {
        setMessage({ variant: "default", content: t('auth.sign-up-form.success') });
      } else {
        switch (response?.error) {
          case 'EMAIL_ALREADY_EXISTS':
            setMessage({ variant: "destructive", content: t('auth.errors.email-already-exists') });
            break;
          case 'INVALID_CREDENTIALS':
            setMessage({ variant: "destructive", content: t('auth.errors.invalid-credentials') });
            break;
          case 'CONTACT_ADMINISTRATOR':
            setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
            break;
        }
      }
    } catch {
      setMessage({ variant: "destructive", content: t('auth.errors.contact-administrator') });
    }
  };

  const signUpOAuth = async (provider: 'MicrosoftOAuth' | 'GoogleOAuth') => {
    try {
      await executeOAuth({ provider });
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
            <CardTitle className="text-xl">{t('auth.sign-up-form.title')}</CardTitle>
            <CardDescription>
              {t('auth.sign-up-form.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => signUpOAuth('MicrosoftOAuth')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                    <path fill="currentColor" d="M0 0h11v11H0zm13 0h11v11H13zM0 13h11v11H0zm13 0h11v11H13z"/>
                  </svg>
                  {t('auth.sign-up-form.microsoft-button')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => signUpOAuth('GoogleOAuth')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('auth.sign-up-form.google-button')}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  {t('auth.fields.or-continue')}
                </span>
              </div>
              {message && (
                <Alert variant={message.variant}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.content}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(signUp)} className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }: { field: ControllerRenderProps<SignUpFormData, "firstName"> }) => (
                      <FormItem>
                        <FormLabel>{t('auth.fields.first-name')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('auth.fields.first-name-placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }: { field: ControllerRenderProps<SignUpFormData, "lastName"> }) => (
                      <FormItem>
                        <FormLabel>{t('auth.fields.last-name')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('auth.fields.last-name-placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: ControllerRenderProps<SignUpFormData, "email"> }) => (
                      <FormItem>
                        <FormLabel>{t('auth.fields.email')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder={t('auth.fields.email-placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: { field: ControllerRenderProps<SignUpFormData, "password"> }) => (
                      <FormItem>
                        <FormLabel>{t('auth.fields.password')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={t('auth.fields.password-placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? t('auth.sign-up-form.submitting') : t('auth.sign-up-form.submit')}
                  </Button>
                </form>
              </Form>
              <div className="text-center text-sm">
                {t('auth.sign-up-form.has-account')}{" "}
                <Link href="/auth/sign-in" className="underline underline-offset-4">
                  {t('auth.sign-in')}
                </Link>
              </div>
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