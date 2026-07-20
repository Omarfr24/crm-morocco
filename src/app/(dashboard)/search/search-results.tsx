"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Search, FileText, Users, Receipt, X } from "lucide-react";
import { useTranslations } from "next-intl";

type SearchData = {
  customers: { id: string; companyName: string; contactPerson: string | null; email: string | null }[];
  quotations: { id: string; quoteNumber: string; status: string; customer: { companyName: string } }[];
  invoices: { id: string; status: string; quotation: { quoteNumber: string; customer: { companyName: string } } }[];
};

export function SearchResults({ initialData }: { initialData: SearchData }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("search");
  const [pending, startTransition] = useTransition();

  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputValue.trim()) params.set("q", inputValue.trim());
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }

  function clearSearch() {
    setInputValue("");
    startTransition(() => {
      router.push("/search");
    });
  }

  const { customers, quotations, invoices } = initialData;
  const hasResults = customers.length > 0 || quotations.length > 0 || invoices.length > 0;
  const q = searchParams.get("q") ?? "";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[2.25rem]">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t("placeholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10 pr-10"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </form>

      {q && !hasResults && (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <Search className="size-14 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t("noResults", { query: q })}</p>
        </div>
      )}

      {customers.length > 0 && (
        <Section title={t("customers")} icon={<Users className="size-4" />} count={customers.length}>
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center justify-between rounded-2xl border bg-card p-4 text-sm hover:shadow-md transition-all duration-200"
            >
              <div className="min-w-0">
                <span className="font-medium">{c.companyName}</span>
                {c.contactPerson && (
                  <span className="text-muted-foreground ml-1.5">
                    · {c.contactPerson}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-3">{c.email || "—"}</span>
            </Link>
          ))}
        </Section>
      )}

      {quotations.length > 0 && (
        <Section title={t("quotations")} icon={<FileText className="size-4" />} count={quotations.length}>
          {quotations.map((qt) => (
            <Link
              key={qt.id}
              href={`/quotations/${qt.id}`}
              className="flex items-center justify-between rounded-2xl border bg-card p-4 text-sm hover:shadow-md transition-all duration-200"
            >
              <div className="min-w-0">
                <span className="font-mono font-medium text-xs">{qt.quoteNumber}</span>
                <span className="text-muted-foreground ml-1.5">
                  · {qt.customer.companyName}
                </span>
              </div>
              <StatusBadge status={qt.status} />
            </Link>
          ))}
        </Section>
      )}

      {invoices.length > 0 && (
        <Section title={t("invoices")} icon={<Receipt className="size-4" />} count={invoices.length}>
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center justify-between rounded-2xl border bg-card p-4 text-sm hover:shadow-md transition-all duration-200"
            >
              <div className="min-w-0">
                <span className="font-mono font-medium text-xs">
                  {inv.quotation.quoteNumber.replace("QT-", "INV-")}
                </span>
                <span className="text-muted-foreground ml-1.5">
                  · {inv.quotation.customer.companyName}
                </span>
              </div>
              <StatusBadge status={inv.status} />
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        {icon}
        {title}
        <span className="text-xs font-normal text-muted-foreground/60">({count})</span>
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
