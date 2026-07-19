import { Suspense } from "react";
import { globalSearch } from "@/actions/dashboard";
import { SearchResults } from "./search-results";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Suspense fallback={<SearchLoading />}>
      <SearchResults initialData={data} />
    </Suspense>
  );
}

function SearchLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-full max-w-lg" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
