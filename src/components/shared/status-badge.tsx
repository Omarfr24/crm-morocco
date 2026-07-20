"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_STYLES: Record<string, StatusVariant> = {
  DRAFT: "outline",
  SENT: "secondary",
  PENDING: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
  EXPIRED: "destructive",
  UNPAID: "destructive",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "",
  SENT: "",
  PENDING: "bg-warning/10 text-warning border-warning/20",
  ACCEPTED: "bg-success/10 text-success border-success/20",
  REJECTED: "",
  EXPIRED: "",
  UNPAID: "",
  PARTIALLY_PAID: "bg-warning/10 text-warning border-warning/20",
  PAID: "bg-success/10 text-success border-success/20",
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
  const colors = STATUS_COLORS[status] ?? "";

  return (
    <Badge variant={variant} className={colors}>
      {label}
    </Badge>
  );
}
