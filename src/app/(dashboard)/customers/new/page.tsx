import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/components/shared/customer-form";
import { createCustomer } from "@/actions/customers";
import type { CustomerInput } from "@/schemas/customer";

export default function NewCustomerPage() {
  async function handleSubmit(data: CustomerInput) {
    "use server";
    return createCustomer(data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Customer"
        description="Add a new customer to your CRM"
      />
      <div className="max-w-2xl">
        <CustomerForm
          onSubmit={handleSubmit}
          submitLabel="Create Customer"
        />
      </div>
    </div>
  );
}
