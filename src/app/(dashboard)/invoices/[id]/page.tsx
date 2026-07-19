import { notFound } from "next/navigation";
import { getInvoice, recordPayment, deletePayment } from "@/actions/invoices";
import { PageHeader } from "@/components/shared/page-header";
import { InvoiceDetail } from "./invoice-detail";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const result = await getInvoice(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { payments: rawPayments, quotation, ...invoiceData } = result.data;
  const payments = rawPayments.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));

  async function handleRecordPayment(data: Parameters<typeof recordPayment>[1]) {
    "use server";
    return recordPayment(id, data);
  }

  async function handleDeletePayment(paymentId: string) {
    "use server";
    return deletePayment(paymentId);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice — ${quotation.quoteNumber.replace("QT-", "INV-")}`}
        description={`${quotation.customer.companyName} — ${invoiceData.status.replace("_", " ")}`}
      />
      <InvoiceDetail
        invoice={{
          ...invoiceData,
          totalAmount: Number(invoiceData.totalAmount),
          paidAmount: Number(invoiceData.paidAmount),
          quotation,
        }}
        payments={payments}
        currency={quotation.currency}
        onRecordPayment={handleRecordPayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}
