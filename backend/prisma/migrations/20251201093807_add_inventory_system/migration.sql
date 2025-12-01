/*
  Warnings:

  - Added the required column `reason` to the `ConsumptionTracking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConsumptionTracking" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "totalCost" DOUBLE PRECISION,
ADD COLUMN     "unitCost" DOUBLE PRECISION,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "productName" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ConsumptionTracking_reason_idx" ON "ConsumptionTracking"("reason");

-- CreateIndex
CREATE INDEX "ConsumptionTracking_userId_idx" ON "ConsumptionTracking"("userId");
