-- CreateTable
CREATE TABLE "CommodityPrice" (
    "id" SERIAL NOT NULL,
    "commodity" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pricePerQuintal" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'quintal',
    "source" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommodityPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommodityPrice_commodity_idx" ON "CommodityPrice"("commodity");

-- CreateIndex
CREATE INDEX "CommodityPrice_district_idx" ON "CommodityPrice"("district");

-- CreateIndex
CREATE INDEX "CommodityPrice_state_idx" ON "CommodityPrice"("state");

-- CreateIndex
CREATE INDEX "CommodityPrice_marketName_idx" ON "CommodityPrice"("marketName");
