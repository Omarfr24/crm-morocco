import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/components/shared/customer-form";
import { createCustomer } from "@/actions/customers";
import type { CustomerInput } from "@/schemas/customer";
import { getTranslations } from "@/i18n/request";

export default async function NewCustomerPage() {
  const { t } = await getTranslations("customers");

  async function handleSubmit(data: CustomerInput) {
    "use server";
    return createCustomer(data);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={t("newCustomer")}
        description={t("newCustomerDescription")}
      />
      <CustomerForm
        onSubmit={handleSubmit}
        submitLabel={t("createCustomer")}
      />
    </div>
  );
}
