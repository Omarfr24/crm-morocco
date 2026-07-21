-- Drop the global unique constraint on quoteNumber
DROP INDEX "Quotation_quoteNumber_key";

-- Add compound unique constraint scoped to organization
CREATE UNIQUE INDEX "Quotation_organizationId_quoteNumber_key" ON "Quotation"("organizationId", "quoteNumber");
