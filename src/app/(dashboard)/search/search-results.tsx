"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Search, FileText, Users, Receipt } from "lucide-react";

type SearchData = {
  customers: { id: string; companyName: string; contactPerson: string | null; email: string | null }[];
  quotations: { id: string; quoteNumber: string; status: string; customer: { companyName: string } }[];
  invoices: { id: string; status: string; quotation: { quoteNumber: string; customer: { companyName: string } } }[];
};

export function SearchResults({ initialData }: { initialData: SearchData }) {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const { customers, quotations, invoices } = initialData;
  const hasResults = customers.length > 0 || quotations.length > 0 || invoices.length > 0;
  const q = searchParams.get("q") ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Search</h1>
        <p className="text-muted-foreground text-sm">
          Search across customers, quotations, and invoices
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name, company, quote number..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </form>

      {q && !hasResults && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Search className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No results found for &ldquo;{q}&rdquo;</p>
        </div>
      )}

      {customers.length > 0 && (
        <Section title="Customers" icon={<Users className="size-4" />} count={customers.length}>
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-3.5 text-sm hover:shadow-xs transition-all"
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
        <Section title="Quotations" icon={<FileText className="size-4" />} count={quotations.length}>
          {quotations.map((qt) => (
            <Link
              key={qt.id}
              href={`/quotations/${qt.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-3.5 text-sm hover:shadow-xs transition-all"
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
        <Section title="Invoices" icon={<Receipt className="size-4" />} count={invoices.length}>
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-3.5 text-sm hover:shadow-xs transition-all"
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
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {icon}
        {title}
        <span className="text-xs font-normal text-muted-foreground/60">({count})</span>
      </h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
