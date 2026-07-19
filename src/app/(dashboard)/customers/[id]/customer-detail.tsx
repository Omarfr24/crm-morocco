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
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2 } from "lucide-react";

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

export function CustomerDetail({ customer, onUpdate, onDelete }: CustomerDetailProps) {
  const [editing, setEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    const result = await onDelete();
    if (!result.success) {
      setDeleteError(result.error ?? "Failed to delete customer.");
      setDeleting(false);
      return;
    }
    router.push("/customers");
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Edit Customer</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        <Separator />
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
            submitLabel="Save Changes"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5" size="sm">
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} size="sm" className="inline-flex items-center gap-1.5">
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
          <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
            <InfoRow label="Company" value={customer.companyName} />
            <InfoRow label="Contact Person" value={customer.contactPerson} />
            <InfoRow label="Phone" value={customer.phone} />
            <InfoRow label="WhatsApp" value={customer.whatsapp} />
            <InfoRow label="Email" value={customer.email} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Additional Details</h3>
          <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
            <InfoRow label="Address" value={customer.address} />
            <InfoRow label="Notes" value={customer.notes} />
            <InfoRow
              label="Created"
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
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{customer.companyName}</strong>?
              This action cannot be undone.
            </DialogDescription>
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
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
      <span>{value || "—"}</span>
    </div>
  );
}
