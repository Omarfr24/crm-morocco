"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type QuotationItem = {
  id: string;
  quoteNumber: string;
  status: string;
  currency: string;
  date: Date;
  customer?: { companyName: string } | null;
};

interface QuotationTableProps {
  items: QuotationItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: string;
}



export function QuotationTable({
  items,
  total,
  page,
  pageSize,
  search,
  statusFilter,
}: QuotationTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("quotations");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);

  const STATUS_OPTIONS = [
    { value: "", label: tc("all") },
    { value: "DRAFT", label: t("statusDraft") },
    { value: "SENT", label: t("statusSent") },
    { value: "PENDING", label: t("statusPending") },
    { value: "ACCEPTED", label: t("statusAccepted") },
    { value: "REJECTED", label: t("statusRejected") },
    { value: "EXPIRED", label: t("statusExpired") },
  ];

  const totalPages = Math.ceil(total / pageSize);

  function pushParams(params: URLSearchParams) {
    startTransition(() => {
      router.push(`/quotations?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("q", searchInput);
    } else {
      params.delete("q");
    }
    params.delete("page");
    pushParams(params);
  }

  function handleStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("page");
    pushParams(params);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    pushParams(params);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>

        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusFilter(opt.value)}
              className={cn(
                "shrink-0 text-xs",
                statusFilter === opt.value && "shadow-xs"
              )}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="hidden md:block rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("quoteNumber")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p className="text-sm">{t("noQuotations")}</p>
                    <Link
                      href="/quotations/new"
                      className="text-sm text-primary hover:underline"
                    >
                      {tc("createOne")}
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((q) => (
                <TableRow
                  key={q.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/quotations/${q.id}`)}
                >
                  <TableCell className="font-mono font-medium text-xs">
                    {q.quoteNumber}
                  </TableCell>
                  <TableCell>{q.customer?.companyName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(q.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-2">
          {items.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t("noQuotations")}</p>
            <Link
              href="/quotations/new"
              className="text-sm text-primary hover:underline"
            >
              {tc("createOne")}
            </Link>
          </div>
        ) : (
          items.map((q) => (
            <Link
              key={q.id}
              href={`/quotations/${q.id}`}
              className="block rounded-xl border bg-card p-4 hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-mono font-medium text-xs">{q.quoteNumber}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {q.customer?.companyName ?? "—"}
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(q.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tc("pageXofY", { page: String(page), totalPages: String(totalPages) })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => goToPage(page - 1)}
              className="inline-flex items-center gap-1"
            >
              <ChevronLeft className="size-3.5" />
              {tc("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => goToPage(page + 1)}
              className="inline-flex items-center gap-1"
            >
              {tc("next")}
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
