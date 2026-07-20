"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type QuotationInput, calculateItemTotal, calculateQuotationTotal } from "@/schemas/quotation";
import { QuotationForm } from "@/components/shared/quotation-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Download,
  MessageCircle,
  Mail,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

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
  const t = useTranslations("quotations");
  const tc = useTranslations("common");
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

  const STATUS_FLOW: Record<string, { label: string; next: string }[]> = {
    DRAFT: [{ label: t("markAsSent"), next: "SENT" }],
    SENT: [
      { label: t("markAsPending"), next: "PENDING" },
      { label: t("reject"), next: "REJECTED" },
    ],
    PENDING: [
      { label: t("accept"), next: "ACCEPTED" },
      { label: t("reject"), next: "REJECTED" },
    ],
  };

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
      setDeleteError(result.error ?? t("failedToDelete"));
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
      setEmailMessage(result.error ?? t("failedToGenerateWhatsApp"));
    }
  }

  async function handleSendEmail() {
    if (!emailInput) {
      setEmailMessage(t("emailRequired"));
      return;
    }
    setEmailLoading(true);
    setEmailMessage("");
    const result = await onSendEmail(emailInput);
    setEmailLoading(false);
    if (result.success) {
      setEmailMessage(t("emailSentSuccess"));
      setTimeout(() => {
        setShowEmailDialog(false);
        setEmailMessage("");
      }, 2000);
    } else {
      setEmailMessage(result.error ?? t("failedToSendEmail"));
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t("editQuotation")}</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            {tc("cancel")}
          </Button>
        </div>
        <Separator />
        <QuotationForm
          customers={customers}
          defaultValues={{
            customerId: "",
            currency: quotation.currency,
            date: quotation.date,
            expirationDate: quotation.expirationDate,
            notes: quotation.notes ?? "",
            nextFollowUpDate: quotation.nextFollowUpDate,
            items,
          }}
          onSubmit={onUpdate}
          submitLabel={tc("save")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={quotation.status} />
        {actions.map((action) => (
          <Button
            key={action.next}
            size="sm"
            disabled={statusLoading}
            onClick={() => handleStatus(action.next)}
            className="inline-flex items-center gap-1.5"
          >
            {action.label}
            <ChevronRight className="size-3.5" />
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {isDraft && (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5">
              <Pencil className="size-3.5" />
              {tc("edit")}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)} className="inline-flex items-center gap-1.5">
              <Trash2 className="size-3.5" />
              {tc("delete")}
            </Button>
          </>
        )}
        <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5">
          <a href={`/api/pdf/${quotationId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
            <Download className="size-3.5" />
            {t("pdf")}
          </a>
        </Button>
        <Button size="sm" variant="outline" onClick={handleWhatsApp} className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-3.5" />
          {t("whatsapp")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowEmailDialog(true)} className="inline-flex items-center gap-1.5">
          <Mail className="size-3.5" />
          {t("email")}
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
                setError(result.error ?? t("failedToConvert"));
              }
            }}
            disabled={converting || hasInvoice}
            className="inline-flex items-center gap-1.5"
          >
            {converting ? t("converting") : hasInvoice ? t("invoiceExists") : t("convertToInvoice")}
            {!hasInvoice && !converting && <ArrowRight className="size-3.5" />}
          </Button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("details")}</h3>
          <InfoRow label={t("customer")} value={quotation.customer?.companyName ?? "—"} />
          <InfoRow
            label={t("date")}
            value={new Date(quotation.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
          {quotation.expirationDate && (
            <InfoRow
              label={t("expires")}
              value={new Date(quotation.expirationDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          )}
          {quotation.nextFollowUpDate && (
            <InfoRow
              label={t("nextFollowUp")}
              value={new Date(quotation.nextFollowUpDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          )}
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("reference")}</h3>
          <InfoRow label={t("quoteNumber")} value={quotation.quoteNumber} />
          <InfoRow label={t("currency")} value={quotation.currency} />
          {quotation.notes && <InfoRow label={t("notes")} value={quotation.notes} />}
        </div>
      </div>

      <div className="hidden md:block rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left font-medium p-3">{t("itemName")}</th>
              <th className="text-left font-medium p-3 w-[80px]">{t("itemQty")}</th>
              <th className="text-left font-medium p-3 w-[100px]">{t("unitPrice")}</th>
              <th className="text-left font-medium p-3 w-[80px]">{t("discPercent")}</th>
              <th className="text-left font-medium p-3 w-[80px]">{t("taxPercent")}</th>
              <th className="text-right font-medium p-3 w-[100px]">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="p-3">
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3 font-mono text-xs">{item.unitPrice.toFixed(2)}</td>
                <td className="p-3">{item.discount}%</td>
                <td className="p-3">{item.tax}%</td>
                <td className="p-3 text-right font-mono text-xs">
                  {calculateItemTotal(item).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border bg-card p-4 text-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              <span className="font-mono text-xs font-medium">
                {calculateItemTotal(item).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{t("itemQtyLabel")} {item.quantity}</span>
              <span>{t("itemPriceLabel")} {item.unitPrice.toFixed(2)}</span>
              {item.discount > 0 && <span>{t("itemDiscLabel")} {item.discount}%</span>}
              {item.tax > 0 && <span>{t("itemTaxLabel")} {item.tax}%</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64 space-y-2">
          <Separator />
          <div className="flex justify-between pt-2 text-sm font-bold">
            <span>{t("totalWithCurrency", { currency: quotation.currency })}</span>
            <span>{grandTotal.toFixed(2)} {quotation.currency}</span>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteQuotation")}</DialogTitle>
            <DialogDescription>
              {t.rich("deleteConfirm", { quoteNumber: quotation.quoteNumber, strong: (chunks) => <strong>{chunks}</strong> })}
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              {tc("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t("deleting") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sendEmailTitle")}</DialogTitle>
            <DialogDescription>
              {t.rich("sendEmailDescription", { quoteNumber: quotation.quoteNumber, strong: (chunks) => <strong>{chunks}</strong> })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder={t("recipientPlaceholder")}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={emailLoading}
            />
            {emailMessage && (
              <p className={`text-sm ${emailMessage.includes("success") ? "text-success" : "text-destructive"}`}>
                {emailMessage}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={emailLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={emailLoading}>
              {emailLoading ? tc("sending") : t("sendEmailButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
