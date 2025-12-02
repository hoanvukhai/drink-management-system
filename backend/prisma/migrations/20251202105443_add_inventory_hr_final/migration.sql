/*
  Warnings:

  - The values [CANCELLED] on the enum `ShiftStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `balanceAfter` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `balanceBefore` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseOrderId` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `stockTakeId` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `displayQuantity` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `displayUnit` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `inventoryItemId` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `stockUnit` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the `ConsumptionTracking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItemEdit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockTake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockTakeItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitConversion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[recipeId,ingredientId]` on the table `RecipeIngredient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `change` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingredientId` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `InventoryTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingredientId` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IMPORT', 'EXPORT_SALES', 'EXPORT_DAMAGE', 'AUDIT');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
BEGIN;
CREATE TYPE "ShiftStatus_new" AS ENUM ('ASSIGNED', 'STARTED', 'ENDED');
ALTER TABLE "Shift" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Shift" ALTER COLUMN "status" TYPE "ShiftStatus_new" USING ("status"::text::"ShiftStatus_new");
ALTER TYPE "ShiftStatus" RENAME TO "ShiftStatus_old";
ALTER TYPE "ShiftStatus_new" RENAME TO "ShiftStatus";
DROP TYPE "ShiftStatus_old";
ALTER TABLE "Shift" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';
COMMIT;

-- DropForeignKey
ALTER TABLE "ConsumptionTracking" DROP CONSTRAINT "ConsumptionTracking_itemId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_itemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemEdit" DROP CONSTRAINT "OrderItemEdit_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "StockTake" DROP CONSTRAINT "StockTake_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StockTakeItem" DROP CONSTRAINT "StockTakeItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "StockTakeItem" DROP CONSTRAINT "StockTakeItem_stockTakeId_fkey";

-- DropForeignKey
ALTER TABLE "UnitConversion" DROP CONSTRAINT "UnitConversion_inventoryItemId_fkey";

-- DropIndex
DROP INDEX "Attendance_checkIn_idx";

-- DropIndex
DROP INDEX "Attendance_userId_idx";

-- DropIndex
DROP INDEX "InventoryTransaction_createdAt_idx";

-- DropIndex
DROP INDEX "InventoryTransaction_itemId_idx";

-- DropIndex
DROP INDEX "InventoryTransaction_userId_idx";

-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- DropIndex
DROP INDEX "Order_createdById_idx";

-- DropIndex
DROP INDEX "Order_type_idx";

-- DropIndex
DROP INDEX "OrderItem_isCompleted_idx";

-- DropIndex
DROP INDEX "OrderItem_productId_idx";

-- DropIndex
DROP INDEX "Product_available_idx";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- DropIndex
DROP INDEX "RecipeIngredient_inventoryItemId_idx";

-- DropIndex
DROP INDEX "RecipeIngredient_recipeId_idx";

-- DropIndex
DROP INDEX "Shift_startTime_idx";

-- DropIndex
DROP INDEX "Shift_status_idx";

-- DropIndex
DROP INDEX "Shift_userId_idx";

-- DropIndex
DROP INDEX "Table_status_idx";

-- DropIndex
DROP INDEX "Table_zoneId_idx";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "notes",
ADD COLUMN     "note" TEXT,
ALTER COLUMN "checkIn" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "InventoryTransaction" DROP COLUMN "balanceAfter",
DROP COLUMN "balanceBefore",
DROP COLUMN "itemId",
DROP COLUMN "notes",
DROP COLUMN "purchaseOrderId",
DROP COLUMN "quantity",
DROP COLUMN "stockTakeId",
DROP COLUMN "totalCost",
DROP COLUMN "unit",
DROP COLUMN "unitCost",
ADD COLUMN     "change" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ingredientId" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "completedAt";

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "displayQuantity",
DROP COLUMN "displayUnit",
DROP COLUMN "inventoryItemId",
DROP COLUMN "name",
DROP COLUMN "note",
DROP COLUMN "stockQuantity",
DROP COLUMN "stockUnit",
ADD COLUMN     "ingredientId" INTEGER NOT NULL,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "notes";

-- DropTable
DROP TABLE "ConsumptionTracking";

-- DropTable
DROP TABLE "InventoryCategory";

-- DropTable
DROP TABLE "InventoryItem";

-- DropTable
DROP TABLE "OrderItemEdit";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "PurchaseOrderItem";

-- DropTable
DROP TABLE "StockTake";

-- DropTable
DROP TABLE "StockTakeItem";

-- DropTable
DROP TABLE "Supplier";

-- DropTable
DROP TABLE "UnitConversion";

-- DropEnum
DROP TYPE "InventoryTransactionType";

-- DropEnum
DROP TYPE "PurchaseOrderStatus";

-- DropEnum
DROP TYPE "StockTakeStatus";

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE INDEX "InventoryTransaction_ingredientId_idx" ON "InventoryTransaction"("ingredientId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_type_idx" ON "InventoryTransaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
