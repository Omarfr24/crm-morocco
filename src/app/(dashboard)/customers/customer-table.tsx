"use client";

import Link from "next/link";
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Customer = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
};

interface CustomerTableProps {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
}

export function CustomerTable({
  items,
  total,
  page,
  pageSize,
  search,
}: CustomerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);

  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("q", searchInput);
    } else {
      params.delete("q");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/customers?${params.toString()}`);
    });
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`/customers?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </form>

      <div className="hidden md:block rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("company")}</TableHead>
              <TableHead>{t("contact")}</TableHead>
              <TableHead>{t("phone")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead className="w-[100px]">{t("created")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p className="text-sm">{t("noCustomers")}</p>
                    <Link
                      href="/customers/new"
                      className="text-sm text-primary hover:underline"
                    >
                      {tc("createOne")}
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell className="font-medium">
                    {customer.companyName}
                  </TableCell>
                  <TableCell>{customer.contactPerson || "—"}</TableCell>
                  <TableCell>{customer.phone || "—"}</TableCell>
                  <TableCell>{customer.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
            <p className="text-sm text-muted-foreground mb-2">{t("noCustomers")}</p>
            <Link
              href="/customers/new"
              className="text-sm text-primary hover:underline"
            >
              {tc("createOne")}
            </Link>
          </div>
        ) : (
          items.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="block rounded-xl border bg-card p-4 hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{customer.companyName}</p>
                  {customer.contactPerson && (
                    <p className="text-sm text-muted-foreground truncate">
                      {customer.contactPerson}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {customer.phone && <span>{customer.phone}</span>}
                {customer.email && <span className="truncate">{customer.email}</span>}
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
