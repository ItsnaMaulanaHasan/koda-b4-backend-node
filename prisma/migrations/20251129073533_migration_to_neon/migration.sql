-- AlterTable
ALTER TABLE "password_resets" ALTER COLUMN "expired_at" SET DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour';
