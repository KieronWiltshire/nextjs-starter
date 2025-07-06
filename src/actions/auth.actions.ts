'use server';


import { getSession, signIn, signOut } from '@/lib/session';
import { redirect, RedirectType } from 'next/navigation';
import { forgotPasswordSchema, signInOAuthSchema, signInSchema, resetPasswordSchema, signUpSchema, signUpOAuthSchema, verifyEmailSchema } from '@/schema/auth';
import { decodeJwtFromSession } from '@/lib/jwt';
import { workos } from '@/lib/workos';
import { getLocale } from 'next-intl/server';
import { sendEmailVerificationEmail, sendForgotPasswordEmail } from './email.actions';
import { createServerAction } from 'zsa';

export type AuthErrorCode =
  | 'PASSWORD_STRENGTH_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_VERIFICATION_REQUIRED'
  | 'INVALID_EMAIL_VERIFICATION_CODE'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'CONTACT_ADMINISTRATOR'
  | string;

export type AuthResponse = 
  | { success: true }
  | { success: false; error: AuthErrorCode };

const createAuthResponse = {
  success: (): AuthResponse => ({ success: true }),
  error: (error: AuthErrorCode): AuthResponse => ({ success: false, error })
};

export const signUpAction = createServerAction()
  .input(signUpSchema, {
    type: "formData"
  })
  .handler(async ({ input }): Promise<AuthResponse> => {
    try {
      await workos.userManagement.createUser({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName
      });

      const authenticationResponse = await workos.userManagement.authenticateWithPassword({
        email: input.email,
        password: input.password,
        clientId: process.env.WORKOS_CLIENT_ID,
      });

      const session = await getSession();
      await signIn(session, authenticationResponse);

      return createAuthResponse.success();
    } catch (error: any) {
      if (error?.rawData?.code === 'password_strength_error') {
        return createAuthResponse.error('PASSWORD_STRENGTH_ERROR');
      }

      if (error?.rawData?.code === 'email_verification_required') {
        await sendEmailVerificationEmail(error.rawData.email_verification_id, error.rawData.pending_authentication_token);
        return createAuthResponse.error('EMAIL_VERIFICATION_REQUIRED');
      }

      if (error?.errors?.some((error: any) => error.code === 'email_not_available')) {
        return createAuthResponse.error('EMAIL_ALREADY_EXISTS');
      }

      return createAuthResponse.error('CONTACT_ADMINISTRATOR');
    }
  });

export const signUpOAuthAction = createServerAction()
  .input(signUpOAuthSchema)
  .handler(async ({ input }) => {
    const state = {
      locale: await getLocale(),
    };

    const authUrl = workos.userManagement.getAuthorizationUrl({
      clientId: process.env.WORKOS_CLIENT_ID,
      provider: input.provider,
      redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
      state: Buffer.from(JSON.stringify(state)).toString('base64'),
    });

    return redirect(authUrl, RedirectType.replace);
  });  

export const signInAction = createServerAction()
  .input(signInSchema, {
    type: "formData"
  })
  .handler(async ({ input }): Promise<AuthResponse> => {
    try {
      const authenticationResponse = await workos.userManagement.authenticateWithPassword({
        clientId: process.env.WORKOS_CLIENT_ID,
        email: input.email,
        password: input.password
      });

      const session = await getSession();
      await signIn(session, authenticationResponse);

      return createAuthResponse.success();
    } catch (error: any) {
      if (error?.rawData?.code === 'invalid_credentials') {
        return createAuthResponse.error('INVALID_CREDENTIALS');
      }

      if (error?.rawData?.code === 'email_verification_required') {
        await sendEmailVerificationEmail(error.rawData.email_verification_id, error.rawData.pending_authentication_token);
        return createAuthResponse.error('EMAIL_VERIFICATION_REQUIRED');
      }
      return createAuthResponse.error('CONTACT_ADMINISTRATOR');
    }
  });

export const signInOAuthAction = createServerAction()
  .input(signInOAuthSchema)
  .handler(async ({ input }) => {
    const authUrl = workos.userManagement.getAuthorizationUrl({
      clientId: process.env.WORKOS_CLIENT_ID,
      provider: input.provider,
      redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    });

    return redirect(authUrl, RedirectType.replace);
  });

export const verifyEmailAction = createServerAction()
  .input(verifyEmailSchema, {
    type: "formData"
  })
  .handler(async ({ input }): Promise<AuthResponse> => {
    if (input.token) {
      try {
        const authenticationResponse = await workos.userManagement.authenticateWithEmailVerification({ 
          clientId: process.env.WORKOS_CLIENT_ID,
          pendingAuthenticationToken: input.token,
          code: input.code
        });

        const session = await getSession();
        await signIn(session, authenticationResponse);

        return createAuthResponse.success();
      } catch (error: any) {
        if (error?.rawData?.code === 'email_verification_code_incorrect') {
          return createAuthResponse.error('INVALID_EMAIL_VERIFICATION_CODE');
        }
      }
    }
    
    // if authentication fails or the auth token wasn't provided, we try to verify the email without authentication
    const users = await workos.userManagement.listUsers({
      email: input.email,
    });

    if (users.data.length === 0) {
      return createAuthResponse.error('EMAIL_NOT_FOUND');
    }

    const user = users.data[0];

    try {
      await workos.userManagement.verifyEmail({
        userId: user.id,
        code: input.code,
      });

      return createAuthResponse.success();
    } catch (error: any) {
      if (error?.rawData?.code === 'email_verification_code_incorrect') {
        return createAuthResponse.error('INVALID_EMAIL_VERIFICATION_CODE');
      }
      return createAuthResponse.error('CONTACT_ADMINISTRATOR');
    }
  });  

export const forgotPasswordAction = createServerAction()
  .input(forgotPasswordSchema, {
    type: "formData"
  })
  .handler(async ({ input }): Promise<AuthResponse> => {
    try {
      const passwordReset = await workos.userManagement.createPasswordReset({
        email: input.email
      });

      await sendForgotPasswordEmail(input.email, passwordReset.passwordResetToken);

      return createAuthResponse.success();
    } catch (error: any) {
      if (error?.code === 'entity_not_found') {
        return createAuthResponse.error('USER_NOT_FOUND');
      }
      return createAuthResponse.error('CONTACT_ADMINISTRATOR');
    }
  });

export const resetPasswordAction = createServerAction()
  .input(resetPasswordSchema, {
    type: "formData"
  })
  .handler(async ({ input }): Promise<AuthResponse> => {
    try {
      await workos.userManagement.resetPassword({
        newPassword: String(input.newPassword),
        token: String(input.token),
      });

      return createAuthResponse.success();
    } catch (error: any) {
      if (error?.rawData?.code === 'password_reset_token_not_found') {
        return createAuthResponse.error('INVALID_TOKEN');
      }
      if (error?.rawData?.code === 'password_reset_token_expired') {
        return createAuthResponse.error('TOKEN_EXPIRED');
      }
      return createAuthResponse.error('CONTACT_ADMINISTRATOR');
    }
  });

export const signOutAction = createServerAction()
  .handler(async (): Promise<AuthResponse> => {
    const session = await getSession();
    const { payload } = await decodeJwtFromSession(session);
    await workos.userManagement.revokeSession({ sessionId: payload.sid as string });
    await signOut(session);

    return createAuthResponse.success();
  });