import { getSession, signIn } from '@/lib/session';
import { redirect, RedirectType } from 'next/navigation';
import { workos } from '@/lib/workos';
import { sendEmailVerificationEmail } from '@/actions/email.actions';

export async function GET(request: Request) {
  let authenticationResponse;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      throw new Error('Invalid authorization code');
    }


    authenticationResponse = await workos.userManagement.authenticateWithCode({
      clientId: process.env.WORKOS_CLIENT_ID,
      code,
    });

    const session = await getSession();
    await signIn(session, authenticationResponse);

    return redirect('/');
  } catch (error: any) {
    if (error.rawData.code === 'email_verification_required') {
      await sendEmailVerificationEmail(error.rawData.email_verification_id, error.rawData.pending_authentication_token);
      return redirect(`/auth/verify-email?email=${error.rawData.email}`, RedirectType.replace);
    }

    return redirect(`/auth/sign-in?error=${error.rawData.code}`);
  }
}