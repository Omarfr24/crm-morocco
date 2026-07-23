import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, _request) => {
      void fetch(`${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/auth/reset-password-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: user.email, url }),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, _request) => {
      void fetch(`${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/auth/verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: user.email, name: user.name, url }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        required: false,
      },
    },
  },
  user: {
    additionalFields: {
      organizationId: {
        type: "string",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "OWNER",
        input: false,
      },
      companyName: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { organizationId: true },
          });
          return {
            data: {
              ...session,
              activeOrganizationId: user?.organizationId ?? null,
            },
          };
        },
      },
    },
    user: {
      create: {
        before: async (data) => {
          const d = data as { name?: string; email: string; companyName?: string };
          const orgName = d.companyName
            || `${d.name || d.email.split("@")[0]}'s Organization`;

          const organization = await db.organization.create({
            data: { name: orgName },
          });

          await db.companyProfile.create({
            data: {
              organizationId: organization.id,
              name: d.name || d.email.split("@")[0],
              email: d.email,
              address: "",
              phone: "",
            },
          });

          log("info", "Organization and CompanyProfile created for new user", { organizationId: organization.id });

          return {
            data: {
              ...data,
              organizationId: organization.id,
            },
          };
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 10,
        max: 10,
      },
      "/sign-up/email": {
        window: 10,
        max: 5,
      },
      "/request-password-reset": {
        window: 60,
        max: 3,
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    },
    useSecureCookies: true,
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
