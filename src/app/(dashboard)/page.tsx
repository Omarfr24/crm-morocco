import Link from "next/link";
import { getDashboardStats } from "@/actions/dashboard";
import { StatusBadge } from "@/components/shared/status-badge";
import { getTranslations } from "@/i18n/request";
import {
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  FileText,
  Plus,
  Search,
  Receipt,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default async function DashboardPage() {
  const { t } = await getTranslations("dashboard");
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

  const totalQuotes = stats.pendingQuotes + stats.acceptedQuotes + stats.recentQuotations.length;
  const acceptanceRate = totalQuotes > 0 ? Math.round((stats.acceptedQuotes / totalQuotes) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-[2.25rem]">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          {t("welcome")}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        <Link
          href="/customers"
          className="group rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:border-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary transition-colors duration-200" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("customers")}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight">{stats.totalCustomers}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.totalCustomers > 0 ? `${stats.totalCustomers} total` : t("noCustomersYet") || "No clients yet"}
          </p>
        </Link>

        <Link
          href="/quotations?status=SENT"
          className="group rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:border-amber-200 dark:hover:border-amber-800/50"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Clock className="size-5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-warning transition-colors duration-200" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("pendingQuotes")}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight">{stats.pendingQuotes}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.pendingQuotes > 0 ? t("awaitingResponse") || "Awaiting response" : t("nonePending") || "None pending"}
          </p>
        </Link>

        <Link
          href="/quotations?status=ACCEPTED"
          className="group rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:border-green-200 dark:hover:border-green-800/50"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle className="size-5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-success transition-colors duration-200" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("acceptedQuotes")}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight">{stats.acceptedQuotes}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {acceptanceRate > 0 ? `${acceptanceRate}% ${t("acceptanceRate") || "acceptance rate"}` : t("noAcceptedYet") || "No accepted yet"}
          </p>
        </Link>

        <Link
          href="/invoices"
          className="group rounded-2xl border bg-card p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:border-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DollarSign className="size-5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary transition-colors duration-200" />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("revenue")}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight">
            {stats.totalRevenue.toLocaleString("en-MA", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium">MAD</span>
            {stats.totalRevenue > 0 ? ` · ${t("totalCollected") || "Total collected"}` : ` · ${t("noRevenueYet") || "No revenue yet"}`}
          </p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("recentQuotations")}</h2>
            <Link
              href="/quotations"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("viewAll")}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {stats.recentQuotations.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <FileText className="size-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {t("noQuotations")}
              </p>
              <Link
                href="/quotations/new"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md transition-all duration-200"
              >
                <Plus className="size-4" />
                {t("createFirstQuotation")}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentQuotations.map((q) => (
                <Link
                  key={q.id}
                  href={`/quotations/${q.id}`}
                  className="flex items-center justify-between rounded-2xl border bg-card p-4 text-sm hover:shadow-md transition-all duration-200 group"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono font-medium text-xs block">
                        {q.quoteNumber}
                      </span>
                      <span className="text-muted-foreground text-xs truncate block">
                        {q.customer.companyName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
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
          <h2 className="text-lg font-semibold">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/customers/new"
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center hover:shadow-md transition-all duration-200 hover:border-primary/20"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <Users className="size-5" />
              </span>
              <span className="text-sm font-medium">{t("newCustomer")}</span>
            </Link>
            <Link
              href="/quotations/new"
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center hover:shadow-md transition-all duration-200 hover:border-primary/20"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <FileText className="size-5" />
              </span>
              <span className="text-sm font-medium">{t("newQuotation")}</span>
            </Link>
            <Link
              href="/invoices"
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center hover:shadow-md transition-all duration-200 hover:border-primary/20"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <Receipt className="size-5" />
              </span>
              <span className="text-sm font-medium">{t("invoices")}</span>
            </Link>
            <Link
              href="/search"
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center hover:shadow-md transition-all duration-200 hover:border-primary/20"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <Search className="size-5" />
              </span>
              <span className="text-sm font-medium">{t("search")}</span>
            </Link>
          </div>

          {stats.overdueFollowUps.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4.5 text-warning" />
                {t("followUpAlerts")}
              </h2>
              <div className="space-y-2">
                {stats.overdueFollowUps.map((q) => (
                  <Link
                    key={q.id}
                    href={`/quotations/${q.id}`}
                    className="flex items-center justify-between rounded-2xl border border-warning/20 bg-warning/5 p-4 text-sm hover:bg-warning/10 transition-colors duration-200"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0">
                        <Calendar className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono font-medium text-xs block">
                          {q.quoteNumber}
                        </span>
                        <span className="text-muted-foreground text-xs truncate block">
                          {q.customer.companyName}
                        </span>
                      </div>
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
