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
import { forgotPasswordSchema } from "@/schema/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForgotPassword } from "@/hooks/actions"
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

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const t = useTranslations();
  
  const { execute: executeForgotPassword, isPending } = useForgotPassword();
  const [message, setMessage] = useState<Message>(null);
  
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const forgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      const [response] = await executeForgotPassword(formData);
      
      if (response?.success) {
        setMessage({ variant: "default", content: t('auth.forgot-password.success') });
      } else {
        switch (response?.error) {
          case 'EMAIL_NOT_FOUND':
            setMessage({ variant: "destructive", content: t('auth.errors.email-not-found') });
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
            <CardTitle className="text-xl">{t('auth.forgot-password.title')}</CardTitle>
            <CardDescription>
              {t('auth.forgot-password.description')}
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(forgotPassword)} className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: ControllerRenderProps<ForgotPasswordFormData, "email"> }) => (
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
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? t('auth.forgot-password.submitting') : t('auth.forgot-password.submit')}
                  </Button>
                </form>
              </Form>
              <div className="text-center text-sm">
                {t('auth.forgot-password.remember-password')}{" "}
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