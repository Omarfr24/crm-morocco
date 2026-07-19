import { notFound, redirect } from "next/navigation";
import { getCustomer, updateCustomer, deleteCustomer } from "@/actions/customers";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerDetail } from "./customer-detail";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const result = await getCustomer(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const customer = result.data;

  async function handleUpdate(data: Parameters<typeof updateCustomer>[1]) {
    "use server";
    return updateCustomer(id, data);
  }

  async function handleDelete() {
    "use server";
    const result = await deleteCustomer(id);
    if (result.success) {
      redirect("/customers");
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.companyName}
        description={customer.contactPerson ? `Contact: ${customer.contactPerson}` : undefined}
      />
      <CustomerDetail
        customer={customer}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
