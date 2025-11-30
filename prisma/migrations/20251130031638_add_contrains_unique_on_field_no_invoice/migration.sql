/*
  Warnings:

  - A unique constraint covering the columns `[no_invoice]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "password_resets" ALTER COLUMN "expired_at" SET DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour';

-- CreateIndex
CREATE UNIQUE INDEX "transactions_no_invoice_key" ON "transactions"("no_invoice");
