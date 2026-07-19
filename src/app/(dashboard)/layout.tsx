import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { log } from "@/lib/logger";
import { SignOutButton } from "./sign-out-button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Customers", href: "/customers", icon: "👥" },
  { label: "Quotations", href: "/quotations", icon: "📋" },
  { label: "Invoices", href: "/invoices", icon: "💰" },
  { label: "Search", href: "/search", icon: "🔍" },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    log("warn", "Unauthenticated access to dashboard");
    redirect("/login");
  }

  log("info", "Dashboard session active", { userId: session.user.id });

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="text-lg font-semibold">
            CRM
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="mb-3 text-sm">
            <p className="font-medium truncate">{session.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {session.user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  );
}
