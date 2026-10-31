-- AlterTable: Add Discord order notification fields to orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discordMessageId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discordChannelId" TEXT;
CREATE INDEX IF NOT EXISTS "orders_discordMessageId_idx" ON "orders"("discordMessageId");
