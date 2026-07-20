"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type CustomerInput, customerSchema } from "@/schemas/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  defaultValues?: Partial<CustomerInput>;
  onSubmit: (data: CustomerInput) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string> }>;
  submitLabel: string;
}

export function CustomerForm({ defaultValues, onSubmit, submitLabel }: CustomerFormProps) {
  const router = useRouter();
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState<CustomerInput>({
    companyName: defaultValues?.companyName ?? "",
    contactPerson: defaultValues?.contactPerson ?? "",
    phone: defaultValues?.phone ?? "",
    whatsapp: defaultValues?.whatsapp ?? "",
    email: defaultValues?.email ?? "",
    address: defaultValues?.address ?? "",
    notes: defaultValues?.notes ?? "",
  });

  const hasAdvancedData = !!(defaultValues?.address || defaultValues?.notes);

  function updateField<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
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
    setServerError("");
    setFieldErrors({});

    const parsed = customerSchema.safeParse(form);
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
      setServerError(result.error ?? tc("unexpectedError"));
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      setLoading(false);
      return;
    }

    router.push("/customers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">{t("companyName")} *</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder={t("companyNamePlaceholder")}
              disabled={loading}
            />
            {fieldErrors.companyName && (
              <p className="text-sm text-destructive">{fieldErrors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">{t("contactPersonLabel")}</Label>
            <Input
              id="contactPerson"
              value={form.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
              placeholder={t("contactPersonPlaceholder")}
              disabled={loading}
            />
            {fieldErrors.contactPerson && (
              <p className="text-sm text-destructive">{fieldErrors.contactPerson}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phoneLabel")}</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder={t("phonePlaceholder")}
              disabled={loading}
            />
            {fieldErrors.phone && (
              <p className="text-sm text-destructive">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">{t("whatsappLabel")}</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder={t("whatsappPlaceholder")}
              disabled={loading}
            />
            {fieldErrors.whatsapp && (
              <p className="text-sm text-destructive">{fieldErrors.whatsapp}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder={t("emailPlaceholder")}
            disabled={loading}
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={cn("size-4 transition-transform duration-200", showAdvanced && "rotate-180")} />
          {t("advancedInformation") || "Advanced Information"}
        </button>

        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          (showAdvanced || hasAdvancedData) ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t("addressLabel")}</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder={t("addressPlaceholder")}
                disabled={loading}
                rows={2}
              />
              {fieldErrors.address && (
                <p className="text-sm text-destructive">{fieldErrors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notesLabel")}</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder={t("notesPlaceholder")}
                disabled={loading}
                rows={3}
              />
              {fieldErrors.notes && (
                <p className="text-sm text-destructive">{fieldErrors.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="sm:w-auto"
        >
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={loading} className="sm:w-auto">
          {loading ? tc("saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
