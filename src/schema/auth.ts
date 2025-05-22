import { object, string, enum as zodEnum } from "zod"

export const signUpSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
  firstName: string({ required_error: "First name is required" })
    .min(1, "First name is required"),
  lastName: string({ required_error: "Last name is required" })
    .min(1, "Last name is required"),
});

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
});

export const signInOAuthSchema = object({
  provider: zodEnum([
    'MicrosoftOAuth', 
    'GoogleOAuth'
  ])
});

export const signUpOAuthSchema = signInOAuthSchema;

export const verifyEmailSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required"),
  code: string({ required_error: "Code is required" })
    .min(6, "Code is required"),
  token: string().optional(),
});

export const forgotPasswordSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
});

export const resetPasswordSchema = object({
  newPassword: string({ required_error: "New password is required" })
    .min(1, "New password is required")
    .min(8, "New password must be more than 8 characters"),
  token: string({ required_error: "Token is required" })
    .min(1, "Token is required"),
});