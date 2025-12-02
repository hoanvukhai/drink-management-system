/*
  Warnings:

  - Made the column `createdAt` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "completedAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "OrderItemEdit" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItemEdit_orderItemId_idx" ON "OrderItemEdit"("orderItemId");

-- AddForeignKey
ALTER TABLE "OrderItemEdit" ADD CONSTRAINT "OrderItemEdit_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
