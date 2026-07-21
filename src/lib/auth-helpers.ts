import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export async function requireAuth(): Promise<AuthSession> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session as AuthSession;
}

export async function getOrganizationId(): Promise<string> {
  const session = await requireAuth();
  const orgId = session.user.organizationId;
  if (!orgId) throw new Error("No organization associated with this account");
  return orgId;
}
