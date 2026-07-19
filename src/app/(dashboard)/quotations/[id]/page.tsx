import { notFound } from "next/navigation";
import { getQuotation, updateQuotation, updateQuotationStatus, deleteQuotation } from "@/actions/quotations";
import { convertToInvoice } from "@/actions/invoices";
import { getCustomers } from "@/actions/customers";
import { sendQuotationPdfEmail, getWhatsAppLink } from "@/actions/sharing";
import { PageHeader } from "@/components/shared/page-header";
import { QuotationDetail } from "./quotation-detail";

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const { id } = await params;
  const result = await getQuotation(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const quotation = result.data;
  const items = quotation.items.map((it) => ({
    name: it.name,
    description: it.description ?? "",
    quantity: Number(it.quantity),
    unitPrice: Number(it.unitPrice),
    discount: Number(it.discount),
    tax: Number(it.tax),
  }));

  const customersResult = await getCustomers({ pageSize: 200 });
  const customers = customersResult.success
    ? customersResult.data.items.map((c) => ({ id: c.id, companyName: c.companyName }))
    : [];

  async function handleUpdate(data: Parameters<typeof updateQuotation>[1]) {
    "use server";
    return updateQuotation(id, data);
  }

  async function handleStatusUpdate(status: "DRAFT" | "SENT" | "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED") {
    "use server";
    return updateQuotationStatus(id, status);
  }

  async function handleDelete() {
    "use server";
    return deleteQuotation(id);
  }

  async function handleSendEmail(email: string) {
    "use server";
    return sendQuotationPdfEmail(id, email);
  }

  async function handleWhatsAppLink() {
    "use server";
    return getWhatsAppLink(id);
  }

  async function handleConvertToInvoice() {
    "use server";
    return convertToInvoice(id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={quotation.quoteNumber}
        description={`${quotation.customer.companyName} — ${quotation.status}`}
      />
      <QuotationDetail
        quotation={{
          ...quotation,
          date: quotation.date,
          expirationDate: quotation.expirationDate,
          nextFollowUpDate: quotation.nextFollowUpDate,
          lastFollowUpDate: quotation.lastFollowUpDate,
          customer: quotation.customer,
        }}
        items={items}
        customers={customers}
        quotationId={id}
        onUpdate={handleUpdate}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        onSendEmail={handleSendEmail}
        onWhatsAppLink={handleWhatsAppLink}
        onConvertToInvoice={handleConvertToInvoice}
        hasInvoice={!!quotation.invoice}
      />
    </div>
  );
}
