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
import { Search, ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react";
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

  function clearSearch() {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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

      {items.length === 0 && !search && !statusFilter ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <FileText className="size-14 text-muted-foreground/15 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">{t("noQuotations")}</h3>
          <p className="text-sm text-muted-foreground mb-5">
            {t("noQuotationsDescription") || "Create your first quotation to get started."}
          </p>
          <Link
            href="/quotations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md transition-all duration-200"
          >
            <Plus className="size-4" />
            {t("createFirstQuotation") || tc("createOne")}
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl border overflow-hidden">
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
                        <Search className="size-8 text-muted-foreground/20" />
                        <p className="text-sm">{t("noResults") || "No results found"}</p>
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
              <div className="rounded-2xl border bg-card p-10 text-center">
                <Search className="size-12 text-muted-foreground/15 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{t("noResults") || "No results found"}</p>
              </div>
            ) : (
              items.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border bg-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/quotations/${q.id}`)}
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
                </div>
              ))
            )}
          </div>
        </>
      )}

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
