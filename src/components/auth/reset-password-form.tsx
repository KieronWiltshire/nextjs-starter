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
import { useForm } from "react-hook-form"
import * as z from "zod"
import { resetPasswordSchema } from "@/schema/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useResetPassword } from "@/hooks/actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ControllerRenderProps } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useState } from "react";
import { Alert, AlertDescription, alertVariants } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VariantProps } from "class-variance-authority";

type Message = {
  variant: VariantProps<typeof alertVariants>['variant'];
  content: string;
} | null;

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations();
  const { execute: executeResetPassword, isPending } = useResetPassword();
  const [message, setMessage] = useState<Message>(null);
  
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const resetPassword = async ({ token, newPassword }: ResetPasswordFormData) => {
    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("newPassword", newPassword);
      const [response] = await executeResetPassword(formData);
      
      if (response?.success) {
        setMessage({ variant: "default", content: t('auth.reset-password.success') });
      } else {
        switch (response?.error) {
          case 'INVALID_TOKEN':
            setMessage({ variant: "destructive", content: t('auth.errors.invalid-token') });
            break;
          case 'TOKEN_EXPIRED':
            setMessage({ variant: "destructive", content: t('auth.errors.token-expired') });
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

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.reset-password.invalid-token.title')}</CardTitle>
          <CardDescription>
            {t('auth.reset-password.invalid-token.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/auth/forgot-password">
              {t('auth.reset-password.invalid-token.request-new')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('auth.reset-password.title')}</CardTitle>
        <CardDescription>
          {t('auth.reset-password.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(resetPassword)} className="grid gap-6">
            {message && (
              <Alert variant={message.variant}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message.content}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }: { field: ControllerRenderProps<ResetPasswordFormData, "newPassword"> }) => (
                <FormItem>
                  <FormLabel>{t('auth.fields.new-password')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t('auth.fields.password-placeholder')}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isPending && (
              <Button type="submit" className="w-full">
                {t('auth.reset-password.submit')}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 