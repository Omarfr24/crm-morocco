import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin";

  if (!email || !password) {
    console.error("Usage: npx tsx prisma/seed.ts <email> <password> [name]");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists.`);
    process.exit(0);
  }

  const hashedPassword = await hashPassword(password);

  const organization = await prisma.organization.create({
    data: {
      name: `${name}'s Organization`,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: true,
      organizationId: organization.id,
      role: "OWNER",
      accounts: {
        create: {
          accountId: email,
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  console.log(`Created user: ${user.email} (${user.id})`);
  console.log(`Created organization: ${organization.name} (${organization.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
