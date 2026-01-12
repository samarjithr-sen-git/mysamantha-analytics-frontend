import * as z from "zod";

export const manualOpSchema = z.object({
  user: z.string().min(1, "User selection is required"),
  plan: z.string().min(1, "Plan selection is required"),
  gateway: z.enum(["STRIPE", "RAZORPAY", "GOOGLE", "APPLE"]),
  currency: z.enum(["INR", "USD"]),
  transaction_id: z.string().min(1),
  pg_subscription_id: z.string().min(1),
  total_amount: z.number().min(0),
  tax_amount: z.number().min(0).default(0),
  start_date: z.string(),
  end_date: z.string(),
  auto_renew: z.boolean().default(false),
  in_effect: z.boolean().default(true),
  status: z.string().default("ACTIVE"),
  payment_status: z.string().default("SUCCESSFUL"),
});

export type ManualOpValues = z.infer<typeof manualOpSchema>;