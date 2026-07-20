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
import { Search, ChevronLeft, ChevronRight, Phone, MessageCircle, Mail, Pencil, Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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

  function clearSearch() {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
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

      {items.length === 0 && !search ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <Users className="size-14 text-muted-foreground/15 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">{t("noCustomers")}</h3>
          <p className="text-sm text-muted-foreground mb-5">
            {t("noCustomersDescription") || "Get started by adding your first customer."}
          </p>
          <Link
            href="/customers/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md transition-all duration-200"
          >
            <Plus className="size-4" />
            {t("addFirstCustomer") || tc("createOne")}
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("company")}</TableHead>
                  <TableHead>{t("contact")}</TableHead>
                  <TableHead>{t("phone")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead className="w-[100px]">{t("created")}</TableHead>
                  <TableHead className="w-[120px] text-right">{tc("actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/customers/${customer.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className={cn("flex size-9 items-center justify-center rounded-xl text-xs font-bold shrink-0", getAvatarColor(customer.companyName))}>
                          {getInitials(customer.companyName)}
                        </span>
                        <span className="font-medium truncate max-w-[180px]">{customer.companyName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.contactPerson || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Call"
                          >
                            <Phone className="size-3.5" />
                          </a>
                        )}
                        {customer.phone && (
                          <a
                            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
                            aria-label="WhatsApp"
                          >
                            <MessageCircle className="size-3.5" />
                          </a>
                        )}
                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Email"
                          >
                            <Mail className="size-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/customers/${customer.id}`}
                          className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label="Edit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-2">
            {items.length === 0 ? (
              <div className="rounded-2xl border bg-card p-10 text-center">
                <Search className="size-12 text-muted-foreground/15 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{t("noCustomers")}</p>
                <Link
                  href="/customers/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <Plus className="size-3.5" />
                  {tc("createOne")}
                </Link>
              </div>
            ) : (
              items.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-2xl border bg-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn("flex size-10 items-center justify-center rounded-xl text-xs font-bold shrink-0", getAvatarColor(customer.companyName))}>
                        {getInitials(customer.companyName)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{customer.companyName}</p>
                        {customer.contactPerson && (
                          <p className="text-sm text-muted-foreground truncate">
                            {customer.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {customer.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Call"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                    {customer.phone && (
                      <a
                        href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="size-3.5" />
                      </a>
                    )}
                    {customer.email && (
                      <a
                        href={`mailto:${customer.email}`}
                        className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Email"
                      >
                        <Mail className="size-3.5" />
                      </a>
                    )}
                    <Link
                      href={`/customers/${customer.id}`}
                      className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Edit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="size-3.5" />
                    </Link>
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
