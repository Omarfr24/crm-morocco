import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "OTHER"], {
    message: "Payment method is required",
  }),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
