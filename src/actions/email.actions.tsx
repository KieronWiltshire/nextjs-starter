import 'server-only';
import EmailVerificationEmail from '@emails/email-verification-email';
import { render } from '@react-email/components';
import { getLocale } from 'next-intl/server';
import plunk from '@/lib/plunk';
import { workos } from '@/lib/workos';
import ForgotPasswordEmail from '@emails/forgot-password-email';

export async function sendEmailVerificationEmail(emailVerificationId: string, pendingAuthenticationToken: string) {
    const emailVerification = await workos.userManagement.getEmailVerification(emailVerificationId);
    await plunk.emails.send({
      to: emailVerification.email,
      subject: 'Email Verification',
      body: await render(
        <EmailVerificationEmail 
          locale={await getLocale()}
          email={emailVerification.email}
          code={emailVerification.code}
          pendingAuthenticationToken={pendingAuthenticationToken}           
        />
      )
    });
}

export async function sendForgotPasswordEmail(email: string, passwordResetToken: string) {
  await plunk.emails.send({
    to: email,
    subject: 'Forgot Password',
    body: await render(
      <ForgotPasswordEmail locale={await getLocale()} passwordResetToken={passwordResetToken} />
    )
  });
}