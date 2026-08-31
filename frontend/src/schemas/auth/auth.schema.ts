import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


/**
 * Shop-owner self-registration.
 *
 * Business details sit alongside the credentials because a BUSINESS account
 * without a business cannot register instruments, and the owner would have no
 * way to fix that themselves. Role is deliberately absent — the server always
 * creates a BUSINESS account, whatever a client sends.
 */
export const signupSchema = z
  .object({
    legalName: z
      .string()
      .trim()
      .min(2, "Enter your registered business name.")
      .max(200, "Business name cannot exceed 200 characters."),

    tradeName: z.string().trim().max(200).optional().or(z.literal("")),

    contactName: z
      .string()
      .trim()
      .min(2, "Enter the contact person's name.")
      .max(100, "Name cannot exceed 100 characters."),

    address: z
      .string()
      .trim()
      .min(5, "Enter your business address.")
      .max(500, "Address cannot exceed 500 characters."),

    phone: z.string().trim().max(20).optional().or(z.literal("")),

    displayName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(100, "Name cannot exceed 100 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Enter an email address.")
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Password cannot exceed 128 characters."),

    confirmPassword: z.string().min(1, "Re-enter your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const SIGNUP_DEFAULTS: SignupFormData = {
  legalName: "",
  tradeName: "",
  contactName: "",
  address: "",
  phone: "",
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
