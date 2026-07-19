"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentSchema, type PaymentInput } from "@/schemas/invoice";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Invoice = {
  id: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: Date;
  quotation: {
    quoteNumber: string;
    currency: string;
    notes: string | null;
    customer: {
      companyName: string;
      contactPerson: string | null;
      phone: string | null;
      email: string | null;
      whatsapp: string | null;
      address: string | null;
    };
  };
};

type Payment = {
  id: string;
  amount: number;
  method: string;
  date: Date;
  notes: string | null;
  createdAt: Date;
};

interface InvoiceDetailProps {
  invoice: Invoice;
  payments: Payment[];
  currency: string;
  onRecordPayment: (
    data: PaymentInput
  ) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }>;
  onDeletePayment: (paymentId: string) => Promise<{ success: boolean; error?: string }>;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHECK", label: "Check" },
  { value: "OTHER", label: "Other" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function InvoiceDetail({
  invoice,
  payments,
  currency,
  onRecordPayment,
  onDeletePayment,
}: InvoiceDetailProps) {
  const router = useRouter();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<PaymentInput>({
    amount: 0,
    method: "CASH",
    date: todayStr(),
    notes: "",
  });

  const remaining = invoice.totalAmount - invoice.paidAmount;

  function updateField<K extends keyof PaymentInput>(key: K, value: PaymentInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = paymentSchema.safeParse(form);
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
    const result = await onRecordPayment(parsed.data);

    if (!result.success) {
      setError(result.error ?? "Failed to record payment.");
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setLoading(false);
      return;
    }

    setShowPaymentDialog(false);
    setForm({ amount: 0, method: "CASH", date: todayStr(), notes: "" });
    setLoading(false);
    router.refresh();
  }

  async function handleDeletePayment(paymentId: string) {
    const result = await onDeletePayment(paymentId);
    if (!result.success) {
      setError(result.error ?? "Failed to delete payment.");
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={invoice.status} />
        {remaining > 0 && (
          <Button size="sm" onClick={() => setShowPaymentDialog(true)}>
            Record Payment
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <InfoRow label="Customer" value={invoice.quotation.customer.companyName} />
          <InfoRow label="Contact" value={invoice.quotation.customer.contactPerson} />
          <InfoRow label="Phone" value={invoice.quotation.customer.phone} />
          <InfoRow label="Email" value={invoice.quotation.customer.email} />
          {invoice.quotation.customer.address && (
            <InfoRow label="Address" value={invoice.quotation.customer.address} />
          )}
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{invoice.totalAmount.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium text-green-600">{invoice.paidAmount.toFixed(2)} {currency}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-bold">
              <span>Remaining</span>
              <span className={remaining > 0 ? "text-destructive" : "text-green-600"}>
                {remaining.toFixed(2)} {currency}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Quote: {invoice.quotation.quoteNumber}</p>
            <p>Created: {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "long", year: "numeric",
            })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Payment History</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {new Date(p.date).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {PAYMENT_METHODS.find((m) => m.value === p.method)?.label ?? p.method}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {p.amount.toFixed(2)} {currency}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePayment(p.id)}
                      >
                        ✕
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Remaining balance: <strong>{remaining.toFixed(2)} {currency}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({currency}) *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                max={remaining}
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => updateField("amount", parseFloat(e.target.value) || 0)}
                placeholder={`Max: ${remaining.toFixed(2)}`}
                disabled={loading}
              />
              {fieldErrors.amount && (
                <p className="text-sm text-destructive">{fieldErrors.amount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={form.method}
                onValueChange={(v) => { if (v) updateField("method", v); }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.method && (
                <p className="text-sm text-destructive">{fieldErrors.method}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payDate">Date *</Label>
              <Input
                id="payDate"
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
              <Label htmlFor="payNotes">Notes</Label>
              <Textarea
                id="payNotes"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Optional payment notes..."
                disabled={loading}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span> <span>{value || "—"}</span>
    </div>
  );
}
