import Link from "next/link";
import { getDashboardStats } from "@/actions/dashboard";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

export default async function DashboardPage() {
  const result = await getDashboardStats();

  const stats = result.success
    ? result.data
    : {
        totalCustomers: 0,
        pendingQuotes: 0,
        acceptedQuotes: 0,
        totalRevenue: 0,
        recentQuotations: [],
        overdueFollowUps: [],
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your CRM. Start by adding customers or creating
          quotations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/customers" className="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
          <p className="text-sm font-medium text-muted-foreground">Customers</p>
          <p className="mt-2 text-3xl font-bold">{stats.totalCustomers}</p>
        </Link>
        <Link href="/quotations?status=SENT" className="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
          <p className="text-sm font-medium text-muted-foreground">Pending Quotes</p>
          <p className="mt-2 text-3xl font-bold">{stats.pendingQuotes}</p>
        </Link>
        <Link href="/quotations?status=ACCEPTED" className="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
          <p className="text-sm font-medium text-muted-foreground">Accepted Quotes</p>
          <p className="mt-2 text-3xl font-bold">{stats.acceptedQuotes}</p>
        </Link>
        <Link href="/invoices" className="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
          <p className="mt-2 text-3xl font-bold">
            {stats.totalRevenue.toLocaleString("en-MA", { minimumFractionDigits: 2 })} MAD
          </p>
        </Link>
      </div>

      {stats.overdueFollowUps.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">
            Follow-up Alerts
          </h2>
          <div className="space-y-2">
            {stats.overdueFollowUps.map((q) => (
              <Link
                key={q.id}
                href={`/quotations/${q.id}`}
                className="flex items-center justify-between rounded-md bg-white p-3 text-sm hover:bg-amber-100 transition-colors"
              >
                <div>
                  <span className="font-medium">{q.quoteNumber}</span>
                  <span className="text-muted-foreground ml-2">— {q.customer.companyName}</span>
                </div>
                <span className="text-amber-700 text-xs font-medium">
                  Due: {q.nextFollowUpDate
                    ? new Date(q.nextFollowUpDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Quotations</h2>
          <Link href="/quotations" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View All
          </Link>
        </div>
        {stats.recentQuotations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quotations yet. Create your first one to get started.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentQuotations.map((q) => (
              <Link
                key={q.id}
                href={`/quotations/${q.id}`}
                className="flex items-center justify-between rounded-md border bg-card p-3 text-sm hover:bg-accent transition-colors"
              >
                <div>
                  <span className="font-medium">{q.quoteNumber}</span>
                  <span className="text-muted-foreground ml-2">— {q.customer.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={q.status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(q.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
