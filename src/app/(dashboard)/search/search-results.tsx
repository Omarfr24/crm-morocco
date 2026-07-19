"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";

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
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search across customers, quotations, and invoices
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by name, company, quote number..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-lg"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Searching..." : "Search"}
        </button>
      </form>

      {q && !hasResults && (
        <p className="text-sm text-muted-foreground">No results found.</p>
      )}

      {customers.length > 0 && (
        <Section title="Customers">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent transition-colors"
            >
              <div>
                <span className="font-medium">{c.companyName}</span>
                {c.contactPerson && (
                  <span className="text-muted-foreground ml-2">— {c.contactPerson}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{c.email || "—"}</span>
            </Link>
          ))}
        </Section>
      )}

      {quotations.length > 0 && (
        <Section title="Quotations">
          {quotations.map((qt) => (
            <Link
              key={qt.id}
              href={`/quotations/${qt.id}`}
              className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent transition-colors"
            >
              <div>
                <span className="font-medium">{qt.quoteNumber}</span>
                <span className="text-muted-foreground ml-2">— {qt.customer.companyName}</span>
              </div>
              <StatusBadge status={qt.status} />
            </Link>
          ))}
        </Section>
      )}

      {invoices.length > 0 && (
        <Section title="Invoices">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent transition-colors"
            >
              <div>
                <span className="font-medium">
                  {inv.quotation.quoteNumber.replace("QT-", "INV-")}
                </span>
                <span className="text-muted-foreground ml-2">
                  — {inv.quotation.customer.companyName}
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
