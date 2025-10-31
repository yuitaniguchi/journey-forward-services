/*
  Warnings:

  - The `status` column on the `Request` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `quotedAmount` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `finalAmount` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `cancellationFee` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Changed the type of `serviceType` on the `Request` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PICKUP', 'PICKUP_DELIVERY');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('RECEIVED', 'QUOTED', 'CONFIRMED', 'INVOICED', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "serviceType",
ADD COLUMN     "serviceType" "ServiceType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'RECEIVED',
ALTER COLUMN "quotedAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "finalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "cancellationFee" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Item_requestId_idx" ON "Item"("requestId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_customerId_preferredDate_idx" ON "Request"("customerId", "preferredDate");

-- Round floats to 2 decimals BEFORE changing columns to Decimal
UPDATE "Request" SET "quotedAmount"   = ROUND(CAST("quotedAmount"   AS numeric), 2) WHERE "quotedAmount"   IS NOT NULL;
UPDATE "Request" SET "finalAmount"    = ROUND(CAST("finalAmount"    AS numeric), 2) WHERE "finalAmount"    IS NOT NULL;
UPDATE "Request" SET "cancellationFee"= ROUND(CAST("cancellationFee"AS numeric), 2) WHERE "cancellationFee" IS NOT NULL;
