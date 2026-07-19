import { z } from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  contactPerson: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
