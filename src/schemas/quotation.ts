import { z } from "zod";

export const quotationItemSchema = z.object({
  name: z.string().min(1, "item name is required").max(200),
  description: z.string().max(500).optional().or(z.literal("")),
  quantity: z.coerce.number().min(0.01, "Quantity must be at least 0.01"),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
  discount: z.coerce.number().min(0).max(100).default(0),
  tax: z.coerce.number().min(0).max(100).default(0),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;

export const quotationSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  currency: z.string().default("MAD"),
  date: z.string().min(1, "Date is required"),
  expirationDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  nextFollowUpDate: z.string().optional().or(z.literal("")),
  items: z
    .array(quotationItemSchema)
    .min(1, "At least one line item is required"),
});

export type QuotationInput = z.infer<typeof quotationSchema>;

export function calculateItemTotal(item: QuotationItemInput): number {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = subtotal * (item.discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (item.tax / 100);
  return afterDiscount + taxAmount;
}

export function calculateQuotationTotal(items: QuotationItemInput[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}
