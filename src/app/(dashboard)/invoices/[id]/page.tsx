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

  const { payments: rawPayments, ...rawInvoice } = result.data;
  const payments = rawPayments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    date: p.date,
    notes: p.notes,
    createdAt: p.createdAt,
  }));

  const invoiceData = {
    id: rawInvoice.id,
    status: rawInvoice.status,
    totalAmount: Number(rawInvoice.totalAmount),
    paidAmount: Number(rawInvoice.paidAmount),
    createdAt: rawInvoice.createdAt,
    quotation: {
      quoteNumber: rawInvoice.quotation.quoteNumber,
      currency: rawInvoice.quotation.currency,
      notes: rawInvoice.quotation.notes,
      customer: rawInvoice.quotation.customer,
    },
  };

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
        title={`Invoice — ${invoiceData.quotation.quoteNumber.replace("QT-", "INV-")}`}
        description={`${invoiceData.quotation.customer.companyName} — ${invoiceData.status.replace("_", " ")}`}
      />
      <InvoiceDetail
        invoice={invoiceData}
        payments={payments}
        currency={invoiceData.quotation.currency}
        onRecordPayment={handleRecordPayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}
