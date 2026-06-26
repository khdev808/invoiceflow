-- Compliance & localization fields
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "vatId" TEXT;

ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "invoiceCountry" TEXT NOT NULL DEFAULT 'US';
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "legalFooter" TEXT;
