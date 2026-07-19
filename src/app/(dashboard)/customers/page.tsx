import { PageHeader } from "@/components/shared/page-header";
import { CustomerTable } from "./customer-table";
import { getCustomers } from "@/actions/customers";

interface CustomersPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const result = await getCustomers({ search, page });

  const items = result.success ? result.data.items : [];
  const total = result.success ? result.data.total : 0;
  const pageSize = 20;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${total} customer${total !== 1 ? "s" : ""} total`}
        action={{ label: "New Customer", href: "/customers/new" }}
      />
      <CustomerTable
        items={items}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
      />
    </div>
  );
}
