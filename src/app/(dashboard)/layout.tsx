import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { log } from "@/lib/logger";
import { DashboardShell } from "@/components/shared/dashboard-shell";

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

  if (!session.user.emailVerified) {
    log("warn", "Unverified user accessing dashboard", { userId: session.user.id });
    redirect("/login?error=unverified");
  }

  log("info", "Dashboard session active", { userId: session.user.id, organizationId: session.user.organizationId });

  return (
    <DashboardShell
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </DashboardShell>
  );
}
