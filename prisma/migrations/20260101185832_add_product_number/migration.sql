/*
  Warnings:

  - Added the required column `quantity` to the `LeftOver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productNumber` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LeftOver" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productNumber" TEXT NOT NULL;
