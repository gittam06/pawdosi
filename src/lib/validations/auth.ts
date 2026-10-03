import { z } from "zod";

const trimmed = z.string().trim();

export const emailSchema = trimmed
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

/**
 * 72 bytes is bcrypt's hard limit — anything beyond it is silently ignored,
 * so reject it here rather than letting a user believe it counted.
 */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Passwords cannot be longer than 72 characters.");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
