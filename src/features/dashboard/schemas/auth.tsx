import { z } from "zod";

export const companyAuthSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const domain = email.toLowerCase();
        return domain.endsWith("@zemuria.com") || domain.endsWith("@senatio.com");
      },
      {
        message: "Access restricted to @zemuria.com or @senatio.com emails",
      }
    ),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters"),
});

export type AuthFormValues = z.infer<typeof companyAuthSchema>;