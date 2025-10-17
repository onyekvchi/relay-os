import { z } from "zod";

// Auth: Login
export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormFields = z.infer<typeof LoginSchema>;

// Auth: Register
export const RegisterSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  password_confirmation: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

export type RegisterFormFields = z.infer<typeof RegisterSchema>;

// Auth: Forgot Password
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormFields = z.infer<typeof ForgotPasswordSchema>;

// Auth: Reset Password
export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormFields = z.infer<typeof ResetPasswordSchema>;
