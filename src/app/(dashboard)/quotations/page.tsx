import { PageHeader } from "@/components/shared/page-header";
import { QuotationTable } from "./quotation-table";
import { getQuotations } from "@/actions/quotations";
import { getTranslations } from "@/i18n/request";

interface QuotationsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function QuotationsPage({ searchParams }: QuotationsPageProps) {
  const { t } = await getTranslations("quotations");
  const params = await searchParams;
  const search = params.q ?? "";
  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const result = await getQuotations({ search, status, page });

  const items = result.success ? result.data.items : [];
  const total = result.success ? result.data.total : 0;
  const pageSize = 20;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={total !== 1 ? t("totalPlural", { count: String(total) }) : t("total", { count: String(total) })}
        action={{ label: t("newQuotation"), href: "/quotations/new" }}
      />
      <QuotationTable
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
