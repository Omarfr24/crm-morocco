import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { QuotationForm } from "@/components/shared/quotation-form";
import { createQuotation } from "@/actions/quotations";
import { getCustomers } from "@/actions/customers";
import type { QuotationInput } from "@/schemas/quotation";

export default async function NewQuotationPage() {
  const result = await getCustomers({ pageSize: 200 });

  if (!result.success) {
    notFound();
  }

  const customers = result.data.items.map((c) => ({
    id: c.id,
    companyName: c.companyName,
  }));

  async function handleSubmit(data: QuotationInput) {
    "use server";
    return createQuotation(data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Quotation"
        description="Create a new quotation for a customer"
      />
      <QuotationForm
        customers={customers}
        onSubmit={handleSubmit}
        submitLabel="Create Quotation"
      />
    </div>
  );
}
