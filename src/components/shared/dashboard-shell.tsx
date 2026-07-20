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
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("navigation");
  const tc = useTranslations("common");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { label: t("dashboard"), href: "/", icon: LayoutDashboard },
    { label: t("customers"), href: "/customers", icon: Users },
    { label: t("quotations"), href: "/quotations", icon: FileText },
    { label: t("invoices"), href: "/invoices", icon: Receipt },
    { label: t("search"), href: "/search", icon: Search },
    { label: t("settings"), href: "/settings", icon: Settings },
  ] as const;

  const BOTTOM_NAV_ITEMS: readonly { label: string; href: string; icon: typeof LayoutDashboard; isCenter?: boolean }[] = [
    { label: t("dashboard"), href: "/", icon: LayoutDashboard },
    { label: t("customers"), href: "/customers", icon: Users },
    { label: t("new"), href: "/quotations/new", icon: FileText, isCenter: true },
    { label: t("invoices"), href: "/invoices", icon: Receipt },
    { label: t("more"), href: "/settings", icon: Settings },
  ];

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
            "flex h-16 items-center border-b px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3 text-base font-bold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm shadow-primary/20">
                Q
              </span>
              <span className="text-lg">QuoteFlow</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm shadow-primary/20">
              Q
            </Link>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="size-8"
              aria-label={t("collapseSidebar")}
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="size-[18px] shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t p-2", collapsed && "px-2")}>
          {!collapsed ? (
            <>
              <div className="mb-3 px-3 py-2">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle className="size-8" />
                <LanguageSwitcher className="size-8" compact />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  {t("signOut")}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <ThemeToggle className="size-8" />
              <LanguageSwitcher className="size-8" compact />
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleSignOut}
                aria-label={t("signOutLabel")}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-3 text-base font-bold tracking-tight" onClick={() => setMobileOpen(false)}>
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm shadow-primary/20">
              Q
            </span>
            QuoteFlow
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="size-8"
            aria-label={t("closeMenu")}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="size-8" />
            <LanguageSwitcher className="size-8" compact />
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              {t("signOut")}
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
            aria-label={t("openMenu")}
          >
            <Menu className="size-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2.5 text-sm font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[10px] font-bold shadow-sm shadow-primary/20">
              Q
            </span>
            QuoteFlow
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher className="size-8" compact />
          </div>
        </header>

        <div className="p-4 sm:p-6 pb-28 lg:pb-6 max-w-6xl mx-auto">
          {children}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-md lg:hidden safe-area-bottom">
          <div className="relative flex items-center justify-around px-2 py-1.5">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.isCenter) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative -mt-6"
                  >
                    <span className="flex size-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 active:scale-95 hover:shadow-xl hover:shadow-primary/40">
                      <Plus className="size-6" />
                    </span>
                  </Link>
                );
              }

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
