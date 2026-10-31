-- AlterTable: Add Discord synchronization fields to support_tickets
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "discordThreadId" TEXT;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "discordChannelId" TEXT;
CREATE INDEX IF NOT EXISTS "support_tickets_discordThreadId_idx" ON "support_tickets"("discordThreadId");

-- AlterTable: Add Discord message ID and senderName to ticket_messages
ALTER TABLE "ticket_messages" ADD COLUMN IF NOT EXISTS "senderName" TEXT;
ALTER TABLE "ticket_messages" ADD COLUMN IF NOT EXISTS "discordMessageId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ticket_messages_discordMessageId_key" ON "ticket_messages"("discordMessageId");
