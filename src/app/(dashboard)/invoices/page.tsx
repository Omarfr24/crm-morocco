import { PageHeader } from "@/components/shared/page-header";
import { InvoiceTable } from "./invoice-table";
import { getInvoices } from "@/actions/invoices";
import { getTranslations } from "@/i18n/request";

interface InvoicesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { t } = await getTranslations("invoices");
  const params = await searchParams;
  const search = params.q ?? "";
  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const result = await getInvoices({ search, status, page });

  const items = result.success
    ? result.data.items.map((item) => ({
        ...item,
        totalAmount: Number(item.totalAmount),
        paidAmount: Number(item.paidAmount),
      }))
    : [];
  const total = result.success ? result.data.total : 0;
  const pageSize = 20;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t("title")}
        description={total !== 1 ? t("totalPlural", { count: String(total) }) : t("total", { count: String(total) })}
      />
      <InvoiceTable
        items={items}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
        statusFilter={status}
      />
    </div>
  );
}
