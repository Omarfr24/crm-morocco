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

  const invoice = result.data;

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
        title={`Invoice — ${invoice.quotation.quoteNumber.replace("QT-", "INV-")}`}
        description={`${invoice.quotation.customer.companyName} — ${invoice.status.replace("_", " ")}`}
      />
      <InvoiceDetail
        invoice={{
          ...invoice,
          totalAmount: Number(invoice.totalAmount),
          paidAmount: Number(invoice.paidAmount),
        }}
        payments={invoice.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
        }))}
        currency={invoice.quotation.currency}
        onRecordPayment={handleRecordPayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}
