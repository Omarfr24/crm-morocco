"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type QuotationInput, calculateItemTotal, calculateQuotationTotal } from "@/schemas/quotation";
import { QuotationForm } from "@/components/shared/quotation-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Quotation = {
  id: string;
  quoteNumber: string;
  status: string;
  currency: string;
  date: Date;
  expirationDate: Date | null;
  notes: string | null;
  nextFollowUpDate: Date | null;
  lastFollowUpDate: Date | null;
  customer?: { companyName: string; contactPerson: string | null; whatsapp: string | null; email: string | null } | null;
};

type Item = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
};

type Customer = { id: string; companyName: string };

const STATUS_FLOW: Record<string, { label: string; next: string }[]> = {
  DRAFT: [{ label: "Mark as Sent", next: "SENT" }],
  SENT: [
    { label: "Mark as Pending", next: "PENDING" },
    { label: "Reject", next: "REJECTED" },
  ],
  PENDING: [
    { label: "Accept", next: "ACCEPTED" },
    { label: "Reject", next: "REJECTED" },
  ],
};

interface QuotationDetailProps {
  quotation: Quotation;
  items: Item[];
  customers: Customer[];
  quotationId: string;
  onUpdate: (data: QuotationInput) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }>;
  onStatusUpdate: (status: "DRAFT" | "SENT" | "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED") => Promise<{ success: boolean; error?: string }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  onSendEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  onWhatsAppLink: () => Promise<{ success: boolean; data?: string; error?: string }>;
  onConvertToInvoice?: () => Promise<{ success: boolean; error?: string }>;
  hasInvoice?: boolean;
}

export function QuotationDetail({
  quotation,
  items,
  customers,
  quotationId,
  onUpdate,
  onStatusUpdate,
  onDelete,
  onSendEmail,
  onWhatsAppLink,
  onConvertToInvoice,
  hasInvoice,
}: QuotationDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailInput, setEmailInput] = useState(quotation.customer?.email ?? "");
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");

  const grandTotal = calculateQuotationTotal(items);
  const isDraft = quotation.status === "DRAFT";
  const actions = STATUS_FLOW[quotation.status] ?? [];

  async function handleStatus(nextStatus: string) {
    setStatusLoading(true);
    await onStatusUpdate(nextStatus as "DRAFT" | "SENT" | "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED");
    setStatusLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    const result = await onDelete();
    if (!result.success) {
      setDeleteError(result.error ?? "Failed to delete.");
      setDeleting(false);
      return;
    }
    router.push("/quotations");
  }

  async function handleWhatsApp() {
    const result = await onWhatsAppLink();
    if (result.success && result.data) {
      window.open(result.data, "_blank");
    } else {
      setEmailMessage(result.error ?? "Failed to generate WhatsApp link.");
    }
  }

  async function handleSendEmail() {
    if (!emailInput) {
      setEmailMessage("Please enter an email address.");
      return;
    }
    setEmailLoading(true);
    setEmailMessage("");
    const result = await onSendEmail(emailInput);
    setEmailLoading(false);
    if (result.success) {
      setEmailMessage("Email sent successfully!");
      setTimeout(() => {
        setShowEmailDialog(false);
        setEmailMessage("");
      }, 2000);
    } else {
      setEmailMessage(result.error ?? "Failed to send email.");
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Edit Quotation</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        <Separator />
        <QuotationForm
          customers={customers}
          defaultValues={{
            customerId: "", // Will be set from existing data
            currency: quotation.currency,
            date: quotation.date,
            expirationDate: quotation.expirationDate,
            notes: quotation.notes ?? "",
            nextFollowUpDate: quotation.nextFollowUpDate,
            items,
          }}
          onSubmit={onUpdate}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={quotation.status} />
        {actions.map((action) => (
          <Button
            key={action.next}
            size="sm"
            disabled={statusLoading}
            onClick={() => handleStatus(action.next)}
          >
            {action.label}
          </Button>
        ))}
        {isDraft && (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
          </>
        )}
        <Button size="sm" variant="outline">
          <a href={`/api/pdf/${quotationId}`} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </Button>
        <Button size="sm" variant="outline" onClick={handleWhatsApp}>
          WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowEmailDialog(true)}>
          Send Email
        </Button>
        {onConvertToInvoice && (
          <Button
            size="sm"
            onClick={async () => {
              setConverting(true);
              const result = await onConvertToInvoice();
              setConverting(false);
              if (result.success) {
                router.push(`/invoices/${quotationId}`);
              } else {
                setError(result.error ?? "Failed to convert to invoice.");
              }
            }}
            disabled={converting || hasInvoice}
          >
            {converting ? "Converting..." : hasInvoice ? "Invoice Exists" : "Convert to Invoice"}
          </Button>
        )}
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <InfoRow label="Customer" value={quotation.customer?.companyName ?? "—"} />
          <InfoRow
            label="Date"
            value={new Date(quotation.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
          {quotation.expirationDate && (
            <InfoRow
              label="Expires"
              value={new Date(quotation.expirationDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          )}
          {quotation.nextFollowUpDate && (
            <InfoRow
              label="Next Follow-up"
              value={new Date(quotation.nextFollowUpDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          )}
        </div>
        <div className="space-y-2 text-sm">
          <InfoRow label="Quote Number" value={quotation.quoteNumber} />
          <InfoRow label="Currency" value={quotation.currency} />
          {quotation.notes && <InfoRow label="Notes" value={quotation.notes} />}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="w-[80px]">Qty</TableHead>
              <TableHead className="w-[100px]">Unit Price</TableHead>
              <TableHead className="w-[80px]">Disc%</TableHead>
              <TableHead className="w-[80px]">Tax%</TableHead>
              <TableHead className="w-[100px] text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="font-mono">{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>{item.discount}%</TableCell>
                <TableCell>{item.tax}%</TableCell>
                <TableCell className="text-right font-mono">
                  {calculateItemTotal(item).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-1">
          <Separator />
          <div className="flex justify-between pt-2 text-sm font-bold">
            <span>Total ({quotation.currency})</span>
            <span>{grandTotal.toFixed(2)} {quotation.currency}</span>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quotation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{quotation.quoteNumber}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quotation via Email</DialogTitle>
            <DialogDescription>
              Send <strong>{quotation.quoteNumber}</strong> as a PDF attachment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="recipient@company.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={emailLoading}
            />
            {emailMessage && (
              <p className={`text-sm ${emailMessage.includes("success") ? "text-green-600" : "text-destructive"}`}>
                {emailMessage}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={emailLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={emailLoading}>
              {emailLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span> <span>{value || "—"}</span>
    </div>
  );
}
