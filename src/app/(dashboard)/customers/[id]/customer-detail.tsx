"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type CustomerInput } from "@/schemas/customer";
import { CustomerForm } from "@/components/shared/customer-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Phone, MessageCircle, Mail, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Customer = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
};

interface CustomerDetailProps {
  customer: Customer;
  onUpdate: (data: CustomerInput) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }>;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-primary/10 text-primary",
  "bg-success/10 text-success",
  "bg-warning/10 text-warning",
  "bg-destructive/10 text-destructive",
  "bg-purple-500/10 text-purple-500",
  "bg-cyan-500/10 text-cyan-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function CustomerDetail({ customer, onUpdate, onDelete }: CustomerDetailProps) {
  const [editing, setEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();
  const t = useTranslations("customers");
  const tc = useTranslations("common");

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    const result = await onDelete();
    if (!result.success) {
      setDeleteError(result.error ?? t("failedToDelete"));
      setDeleting(false);
      return;
    }
    router.push("/customers");
  }

  if (editing) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t("editCustomer")}</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            {tc("cancel")}
          </Button>
        </div>
        <div className="max-w-2xl">
          <CustomerForm
            defaultValues={{
              companyName: customer.companyName,
              contactPerson: customer.contactPerson ?? "",
              phone: customer.phone ?? "",
              whatsapp: customer.whatsapp ?? "",
              email: customer.email ?? "",
              address: customer.address ?? "",
              notes: customer.notes ?? "",
            }}
            onSubmit={onUpdate}
            submitLabel={t("saveChanges")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="size-9 inline-flex items-center justify-center rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn("flex size-12 items-center justify-center rounded-2xl text-sm font-bold shrink-0", getAvatarColor(customer.companyName))}>
            {getInitials(customer.companyName)}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{customer.companyName}</h2>
            {customer.contactPerson && (
              <p className="text-sm text-muted-foreground truncate">{customer.contactPerson}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5" size="sm">
          <Pencil className="size-3.5" />
          {tc("edit")}
        </Button>
        {customer.phone && (
          <a href={`tel:${customer.phone}`}>
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" />
              {t("call") || "Call"}
            </Button>
          </a>
        )}
        {(customer.whatsapp || customer.phone) && (
          <a href={`https://wa.me/${(customer.whatsapp || customer.phone || "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5" />
              WhatsApp
            </Button>
          </a>
        )}
        {customer.email && (
          <a href={`mailto:${customer.email}`}>
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {t("email") || "Email"}
            </Button>
          </a>
        )}
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} size="sm" className="inline-flex items-center gap-1.5">
          <Trash2 className="size-3.5" />
          {tc("delete")}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("contactInformation")}</h3>
          <div className="rounded-2xl border bg-card p-5 space-y-4 text-sm">
            <InfoRow label={t("company")} value={customer.companyName} />
            <InfoRow label={t("contactPerson")} value={customer.contactPerson} />
            <InfoRow label={t("phone")} value={customer.phone} />
            <InfoRow label={t("whatsapp")} value={customer.whatsapp} />
            <InfoRow label={t("email")} value={customer.email} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("additionalDetails")}</h3>
          <div className="rounded-2xl border bg-card p-5 space-y-4 text-sm">
            <InfoRow label={t("address")} value={customer.address} />
            <InfoRow label={t("notes")} value={customer.notes} />
            <InfoRow
              label={t("created")}
              value={new Date(customer.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCustomer")}</DialogTitle>
            <DialogDescription>{t("deleteConfirm", { name: customer.companyName })}</DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? tc("deleting") : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="break-words">{value || "—"}</span>
    </div>
  );
}
