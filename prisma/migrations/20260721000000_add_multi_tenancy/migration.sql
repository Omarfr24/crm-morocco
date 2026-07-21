-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Insert a default organization for existing data
INSERT INTO "Organization" ("id", "name", "createdAt") VALUES ('default-org', 'Default Organization', CURRENT_TIMESTAMP);

-- Add organizationId to User (nullable first)
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'OWNER';

-- Backfill User organizationId
UPDATE "User" SET "organizationId" = 'default-org';

-- Make organizationId NOT NULL on User
ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add activeOrganizationId to Session
ALTER TABLE "Session" ADD COLUMN "activeOrganizationId" TEXT;

-- Add organizationId to Customer (nullable first)
ALTER TABLE "Customer" ADD COLUMN "organizationId" TEXT;
UPDATE "Customer" SET "organizationId" = 'default-org';
ALTER TABLE "Customer" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add organizationId to Quotation (nullable first)
ALTER TABLE "Quotation" ADD COLUMN "organizationId" TEXT;
UPDATE "Quotation" SET "organizationId" = 'default-org';
ALTER TABLE "Quotation" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add organizationId to Invoice (nullable first)
ALTER TABLE "Invoice" ADD COLUMN "organizationId" TEXT;
UPDATE "Invoice" SET "organizationId" = 'default-org';
ALTER TABLE "Invoice" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add organizationId to Payment (nullable first)
ALTER TABLE "Payment" ADD COLUMN "organizationId" TEXT;
UPDATE "Payment" SET "organizationId" = 'default-org';
ALTER TABLE "Payment" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add organizationId to CompanyProfile (nullable first)
ALTER TABLE "CompanyProfile" ADD COLUMN "organizationId" TEXT;
UPDATE "CompanyProfile" SET "organizationId" = 'default-org';
ALTER TABLE "CompanyProfile" ALTER COLUMN "organizationId" SET NOT NULL;

-- Add unique constraint on CompanyProfile.organizationId
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_organizationId_key" UNIQUE ("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");
CREATE INDEX "Customer_organizationId_createdAt_idx" ON "Customer"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Quotation_organizationId_idx" ON "Quotation"("organizationId");
CREATE INDEX "Quotation_organizationId_status_idx" ON "Quotation"("organizationId", "status");
CREATE INDEX "Quotation_organizationId_createdAt_idx" ON "Quotation"("organizationId", "createdAt");
CREATE INDEX "Quotation_organizationId_customerId_idx" ON "Quotation"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");
CREATE INDEX "Invoice_organizationId_status_idx" ON "Invoice"("organizationId", "status");
CREATE INDEX "Invoice_organizationId_createdAt_idx" ON "Invoice"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_organizationId_idx" ON "Payment"("organizationId");
CREATE INDEX "Payment_organizationId_createdAt_idx" ON "Payment"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
