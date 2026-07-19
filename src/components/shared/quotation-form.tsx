"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  quotationSchema,
  calculateItemTotal,
  calculateQuotationTotal,
  type QuotationInput,
  type QuotationItemInput,
} from "@/schemas/quotation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type CustomerOption = { id: string; companyName: string };

type QuotationFormDefaults = Omit<Partial<QuotationInput>, "date" | "expirationDate" | "nextFollowUpDate"> & {
  date?: string | Date;
  expirationDate?: string | Date | null;
  nextFollowUpDate?: string | Date | null;
};

interface QuotationFormProps {
  customers: CustomerOption[];
  defaultValues?: QuotationFormDefaults;
  submitLabel: string;
  onSubmit: (
    data: QuotationInput
  ) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }>;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function emptyItem(): QuotationItemInput {
  return { name: "", description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 };
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (typeof d === "string") return d.split("T")[0];
  return d.toISOString().split("T")[0];
}

export function QuotationForm({
  customers,
  defaultValues,
  submitLabel,
  onSubmit,
}: QuotationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<QuotationInput>({
    customerId: defaultValues?.customerId ?? "",
    currency: defaultValues?.currency ?? "MAD",
    date: formatDate(defaultValues?.date) || todayStr(),
    expirationDate: formatDate(defaultValues?.expirationDate),
    notes: defaultValues?.notes ?? "",
    nextFollowUpDate: formatDate(defaultValues?.nextFollowUpDate),
    items: defaultValues?.items?.length ? defaultValues.items.map((it) => ({
      name: it.name,
      description: it.description ?? "",
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      discount: Number(it.discount),
      tax: Number(it.tax),
    })) : [emptyItem()],
  });

  function updateField<K extends keyof QuotationInput>(key: K, value: QuotationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    const errKey = key;
    if (fieldErrors[errKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  }

  function updateItem(idx: number, field: keyof QuotationItemInput, value: string | number) {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
    const errKey = `items.${idx}.${field}`;
    if (fieldErrors[errKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(idx: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }

  const grandTotal = calculateQuotationTotal(form.items);
  const currency = form.currency;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setFieldErrors({});

    const parsed = quotationSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await onSubmit(parsed.data);

    if (!result.success) {
      setServerError(result.error ?? "An unexpected error occurred.");
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setLoading(false);
      return;
    }

    router.push("/quotations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Customer *</Label>
          <Select
            value={form.customerId}
            onValueChange={(v) => { if (v) updateField("customerId", v); }}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.customerId && (
            <p className="text-sm text-destructive">{fieldErrors.customerId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.date && (
            <p className="text-sm text-destructive">{fieldErrors.date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expirationDate">Expiration Date</Label>
          <Input
            id="expirationDate"
            type="date"
            value={form.expirationDate}
            onChange={(e) => updateField("expirationDate", e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Next Follow-up Date</Label>
        <Input
          type="date"
          value={form.nextFollowUpDate}
          onChange={(e) => updateField("nextFollowUpDate", e.target.value)}
          disabled={loading}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>Line Items *</Label>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Item Name</TableHead>
                <TableHead className="w-[80px]">Qty</TableHead>
                <TableHead className="w-[120px]">Unit Price</TableHead>
                <TableHead className="w-[80px]">Disc %</TableHead>
                <TableHead className="w-[80px]">Tax %</TableHead>
                <TableHead className="w-[120px] text-right">Total</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.items.map((item, idx) => {
                const total = calculateItemTotal(item);
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                        placeholder="Item name"
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => updateItem(idx, "discount", e.target.value)}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.tax}
                        onChange={(e) => updateItem(idx, "tax", e.target.value)}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {form.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(idx)}
                          disabled={loading}
                        >
                          ✕
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {fieldErrors["items"] && (
          <p className="text-sm text-destructive">{fieldErrors["items"]}</p>
        )}
        <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={loading}>
          + Add Item
        </Button>
      </div>

      <Separator />

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total ({currency})</span>
            <span className="text-lg font-bold">
              {grandTotal.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Terms, conditions, or additional notes..."
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
