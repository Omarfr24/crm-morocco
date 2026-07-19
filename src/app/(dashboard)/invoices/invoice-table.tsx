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

type InvoiceItem = {
  id: string;
  status: string;
  totalAmount: unknown;
  paidAmount: unknown;
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
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by quote # or customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            Search
          </Button>
        </form>

        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() => handleStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No invoices found. Convert an accepted quotation to create one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                >
                  <TableCell className="font-mono text-sm">
                    {inv.quotation.quoteNumber.replace("QT-", "INV-")}
                  </TableCell>
                  <TableCell>{inv.quotation.customer.companyName}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {inv.quotation.quoteNumber}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(inv.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
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
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
