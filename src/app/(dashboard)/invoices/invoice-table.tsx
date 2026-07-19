"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

type InvoiceItem = {
  id: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: Date;
  quotation: {
    quoteNumber: string;
    customer: { companyName: string };
  };
};

interface InvoiceTableProps {
  items: InvoiceItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIALLY_PAID", label: "Partial" },
  { value: "PAID", label: "Paid" },
];

export function InvoiceTable({
  items,
  total,
  page,
  pageSize,
  search,
  statusFilter,
}: InvoiceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);

  const totalPages = Math.ceil(total / pageSize);

  function pushParams(params: URLSearchParams) {
    startTransition(() => {
      router.push(`/invoices?${params.toString()}`);
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
            placeholder="Search by quote # or customer..."
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
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Quote #</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p className="text-sm">No invoices found.</p>
                    <p className="text-xs">Convert an accepted quotation to create one.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    {inv.quotation.quoteNumber.replace("QT-", "INV-")}
                  </TableCell>
                  <TableCell>{inv.quotation.customer.companyName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {inv.quotation.quoteNumber}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {Number(inv.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {Number(inv.paidAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
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
            <p className="text-sm text-muted-foreground mb-2">No invoices found.</p>
            <p className="text-xs text-muted-foreground">Convert an accepted quotation to create one.</p>
          </div>
        ) : (
          items.map((inv) => (
            <div
              key={inv.id}
              onClick={() => router.push(`/invoices/${inv.id}`)}
              className="block rounded-xl border bg-card p-4 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-mono font-medium text-xs">
                    {inv.quotation.quoteNumber.replace("QT-", "INV-")}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {inv.quotation.customer.companyName}
                  </p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {inv.quotation.quoteNumber}
                </span>
                <div className="flex gap-3">
                  <span>
                    <span className="text-muted-foreground">Total </span>
                    <span className="font-mono font-medium">
                      {Number(inv.totalAmount).toFixed(2)}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Paid </span>
                    <span className="font-mono font-medium text-success">
                      {Number(inv.paidAmount).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
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
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => goToPage(page + 1)}
              className="inline-flex items-center gap-1"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
