import Link from "next/link";
import { getDashboardStats } from "@/actions/dashboard";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  FileText,
  Plus,
} from "lucide-react";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back. Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link
          href="/customers"
          className="group rounded-xl border bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all hover:border-primary/20"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4.5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customers</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{stats.totalCustomers}</p>
        </Link>

        <Link
          href="/quotations?status=SENT"
          className="group rounded-xl border bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all hover:border-amber-200 dark:hover:border-amber-800/50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Clock className="size-4.5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-warning transition-colors" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Quotes</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{stats.pendingQuotes}</p>
        </Link>

        <Link
          href="/quotations?status=ACCEPTED"
          className="group rounded-xl border bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all hover:border-green-200 dark:hover:border-green-800/50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle className="size-4.5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-success transition-colors" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accepted Quotes</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{stats.acceptedQuotes}</p>
        </Link>

        <Link
          href="/invoices"
          className="group rounded-xl border bg-card p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all hover:border-primary/20"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-4.5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {stats.totalRevenue.toLocaleString("en-MA", {
              minimumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-medium text-muted-foreground">MAD</span>
          </p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Quotations</h2>
            <Link
              href="/quotations"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {stats.recentQuotations.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <FileText className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No quotations yet
              </p>
              <Link
                href="/quotations/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="size-3.5" />
                Create First Quotation
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {stats.recentQuotations.map((q) => (
                <Link
                  key={q.id}
                  href={`/quotations/${q.id}`}
                  className="flex items-center justify-between rounded-xl border bg-card p-3.5 text-sm hover:shadow-xs transition-all group"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-medium text-xs">
                      {q.quoteNumber}
                    </span>
                    <span className="text-muted-foreground mx-1.5">·</span>
                    <span className="text-muted-foreground truncate">
                      {q.customer.companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <StatusBadge status={q.status} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
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

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/customers/new"
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center hover:shadow-xs transition-all hover:border-primary/20"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
              <span className="text-sm font-medium">New Customer</span>
            </Link>
            <Link
              href="/quotations/new"
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center hover:shadow-xs transition-all hover:border-primary/20"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <span className="text-sm font-medium">New Quotation</span>
            </Link>
            <Link
              href="/invoices"
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center hover:shadow-xs transition-all hover:border-primary/20"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="size-5" />
              </span>
              <span className="text-sm font-medium">Invoices</span>
            </Link>
            <Link
              href="/search"
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center hover:shadow-xs transition-all hover:border-primary/20"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <span className="text-sm font-medium">Search</span>
            </Link>
          </div>

          {stats.overdueFollowUps.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                Follow-up Alerts
              </h2>
              <div className="space-y-1.5">
                {stats.overdueFollowUps.map((q) => (
                  <Link
                    key={q.id}
                    href={`/quotations/${q.id}`}
                    className="flex items-center justify-between rounded-xl border border-warning/20 bg-warning/5 p-3 text-sm hover:bg-warning/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-mono font-medium text-xs">
                        {q.quoteNumber}
                      </span>
                      <span className="text-muted-foreground mx-1.5">·</span>
                      <span className="text-muted-foreground truncate">
                        {q.customer.companyName}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-warning shrink-0 ml-3">
                      {q.nextFollowUpDate
                        ? new Date(q.nextFollowUpDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )
                        : "—"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
