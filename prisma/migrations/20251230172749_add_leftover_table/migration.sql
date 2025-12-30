-- CreateTable
CREATE TABLE "LeftOver" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "custodianName" TEXT NOT NULL,
    "custodianLocation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeftOver_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeftOver" ADD CONSTRAINT "LeftOver_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
