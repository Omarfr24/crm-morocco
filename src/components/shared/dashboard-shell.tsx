"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Quotations", href: "/quotations", icon: FileText },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Search", href: "/search", icon: Search },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const BOTTOM_NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "New", href: "/quotations/new", icon: FileText },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "More", href: "/settings", icon: Settings },
] as const;

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export function DashboardShell({
  children,
  userName,
  userEmail,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
          "hidden lg:flex",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                Q
              </span>
              <span>QuoteFlow</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              Q
            </Link>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="size-7"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t p-2", collapsed && "px-2")}>
          {!collapsed ? (
            <>
              <div className="mb-2 px-2 py-1">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle className="size-8" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <ThemeToggle className="size-8" />
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight" onClick={() => setMobileOpen(false)}>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              Q
            </span>
            QuoteFlow
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="size-8"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="size-8" />
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-[var(--sidebar-width)] min-w-0" style={{ "--sidebar-width": collapsed ? "68px" : "256px" } as React.CSSProperties}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="size-9"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
              Q
            </span>
            QuoteFlow
          </Link>
        </header>

        <div className="p-4 sm:p-6 pb-24 lg:pb-6 max-w-6xl mx-auto">
          {children}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-md lg:hidden safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-1">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[56px]",
                    active
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
