import { Suspense } from "react";
import { globalSearch } from "@/actions/dashboard";
import { SearchResults } from "./search-results";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";

  const result = await globalSearch(q);
  const data = result.success
    ? result.data
    : { customers: [], quotations: [], invoices: [] };

  return (
    <Suspense fallback={<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Loading search...</p>
      </div>
    </div>}>
      <SearchResults initialData={data} />
    </Suspense>
  );
}
