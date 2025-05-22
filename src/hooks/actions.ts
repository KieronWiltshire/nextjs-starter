import { signInAction, signInOAuthAction, signOutAction, signUpAction, resetPasswordAction, forgotPasswordAction, signUpOAuthAction, verifyEmailAction, createEmailVerificationAction } from "@/actions/auth.actions";
import { useServerAction } from "zsa-react";

export const useSignIn = () => useServerAction(signInAction);
export const useSignInOAuth = () => useServerAction(signInOAuthAction);
export const useSignOut = () => useServerAction(signOutAction);
export const useSignUp = () => useServerAction(signUpAction);
export const useSignUpOAuth = () => useServerAction(signUpOAuthAction);
export const useVerifyEmail = () => useServerAction(verifyEmailAction);
export const useResetPassword = () => useServerAction(resetPasswordAction);
export const useForgotPassword = () => useServerAction(forgotPasswordAction);