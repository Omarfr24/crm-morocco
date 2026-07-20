"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

const STATUS_STYLES: Record<string, StatusVariant> = {
  DRAFT: "outline",
  SENT: "info",
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
  EXPIRED: "destructive",
  UNPAID: "destructive",
  PARTIALLY_PAID: "warning",
  PAID: "success",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const tq = useTranslations("quotations");
  const ti = useTranslations("invoices");

  const STATUS_TRANSLATIONS: Record<string, () => string> = {
    DRAFT: () => tq("statusDraft"),
    SENT: () => tq("statusSent"),
    PENDING: () => tq("statusPending"),
    ACCEPTED: () => tq("statusAccepted"),
    REJECTED: () => tq("statusRejected"),
    EXPIRED: () => tq("statusExpired"),
    UNPAID: () => ti("statusUnpaid"),
    PARTIALLY_PAID: () => ti("statusPartial"),
    PAID: () => ti("statusPaid"),
  };

  const variant = STATUS_STYLES[status] ?? "outline";
  const label = STATUS_TRANSLATIONS[status]?.() ?? status;

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}
