-- Individual QR code per participant + email delivery tracking.
--
-- Previously one QRCode row was shared by every registration in a group
-- (one QR listing all names). Each participant now gets their own QR, which
-- is emailed to that participant's own address.
--
-- Legacy shared QR codes are detached and removed here. After deploying,
-- an admin runs "Kirim QR yang tertunda" in the registrations dashboard to
-- generate and email a fresh individual QR to every confirmed participant.

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('NOT_SENT', 'SENT', 'FAILED');

-- AlterTable: email tracking + transaction group
ALTER TABLE "Registration"
  ADD COLUMN "emailStatus" "EmailStatus" NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN "emailSentAt" TIMESTAMP(3),
  ADD COLUMN "groupId" TEXT;

-- The old FK used ON DELETE CASCADE, which would delete registrations when a
-- QR code is deleted. Drop it BEFORE touching QRCode rows.
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_qrCodeId_fkey";

-- Detach and remove legacy shared QR codes (registrations are kept).
UPDATE "Registration" SET "qrCodeId" = NULL WHERE "qrCodeId" IS NOT NULL;
DELETE FROM "QRCode";

-- AlterTable: unique scan token per QR
ALTER TABLE "QRCode" ADD COLUMN "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_token_key" ON "QRCode"("token");
CREATE UNIQUE INDEX "Registration_qrCodeId_key" ON "Registration"("qrCodeId");
CREATE INDEX "Registration_groupId_idx" ON "Registration"("groupId");

-- Voucher FK also used ON DELETE CASCADE (deleting a voucher deleted the
-- registration that redeemed it). Switch to SET NULL.
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_voucherId_fkey";
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_voucherId_fkey"
  FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey (SET NULL: deleting a QR never deletes a registration)
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_qrCodeId_fkey"
  FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
