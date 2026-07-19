import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  companyName: { fontSize: 18, fontWeight: "bold" },
  companyDetails: { fontSize: 9, color: "#666", marginTop: 4 },
  quoteTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "right", color: "#333" },
  quoteNumber: { fontSize: 10, color: "#666", textAlign: "right", marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#666", width: 120 },
  value: { fontWeight: "bold" },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 6, fontWeight: "bold", fontSize: 9 },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  colItem: { width: 200 },
  colQty: { width: 50, textAlign: "right" },
  colPrice: { width: 80, textAlign: "right" },
  colDisc: { width: 40, textAlign: "right" },
  colTax: { width: 40, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totalSection: { marginTop: 15, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, padding: 3 },
  totalLabel: { fontSize: 10 },
  grandTotal: { fontSize: 13, fontWeight: "bold", borderTopWidth: 1, borderTopColor: "#333", paddingTop: 6, marginTop: 6 },
  notes: { marginTop: 20, padding: 10, backgroundColor: "#fafafa", borderRadius: 4 },
  notesLabel: { fontWeight: "bold", marginBottom: 4, fontSize: 9 },
  notesText: { fontSize: 9, color: "#444" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999" },
});

type Item = {
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
};

type QuotationData = {
  quoteNumber: string;
  date: string;
  expirationDate: string | null;
  currency: string;
  notes: string | null;
  customer: {
    companyName: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  items: Item[];
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
};

function calcItemTotal(item: Item): number {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount = subtotal * (item.discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (item.tax / 100);
  return afterDiscount + taxAmount;
}

export function QuotationDocument({ data }: { data: QuotationData }) {
  const grandTotal = data.items.reduce((sum, item) => sum + calcItemTotal(item), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.company.name}</Text>
            <Text style={styles.companyDetails}>{data.company.address}</Text>
            <Text style={styles.companyDetails}>{data.company.phone}</Text>
            <Text style={styles.companyDetails}>{data.company.email}</Text>
          </View>
          <View>
            <Text style={styles.quoteTitle}>QUOTATION</Text>
            <Text style={styles.quoteNumber}>{data.quoteNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={{ fontWeight: "bold" }}>{data.customer.companyName}</Text>
          {data.customer.contactPerson && <Text>{data.customer.contactPerson}</Text>}
          {data.customer.phone && <Text>{data.customer.phone}</Text>}
          {data.customer.email && <Text>{data.customer.email}</Text>}
          {data.customer.address && <Text>{data.customer.address}</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
          {data.expirationDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Valid Until:</Text>
              <Text style={styles.value}>{data.expirationDate}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Currency:</Text>
            <Text style={styles.value}>{data.currency}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colDisc}>Disc%</Text>
            <Text style={styles.colTax}>Tax%</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {data.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colItem}>
                <Text>{item.name}</Text>
                {item.description && <Text style={{ fontSize: 8, color: "#888" }}>{item.description}</Text>}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colDisc}>{item.discount}%</Text>
              <Text style={styles.colTax}>{item.tax}%</Text>
              <Text style={styles.colTotal}>{calcItemTotal(item).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.grandTotal}>{grandTotal.toFixed(2)} {data.currency}</Text>
          </View>
        </View>

        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes & Terms</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
}
