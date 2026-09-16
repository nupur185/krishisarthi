-- CreateEnum
CREATE TYPE "ProcurementStatus" AS ENUM ('NOT_STARTED', 'QUALITY_CHECK', 'WEIGHTMENT', 'FINALIZATION', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('A', 'B', 'C', 'REJECTED');

-- CreateTable
CREATE TABLE "ProcurementRecord" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "moisturePercent" DECIMAL(5,2),
    "foreignMatterPercent" DECIMAL(5,2),
    "damagedGrainsPercent" DECIMAL(5,2),
    "qualityGrade" "QualityGrade",
    "grossWeightQuintals" DECIMAL(10,2),
    "tareWeightQuintals" DECIMAL(10,2),
    "netWeightQuintals" DECIMAL(10,2),
    "acceptedQuantityQuintals" DECIMAL(10,2),
    "mspPerQuintal" DECIMAL(10,2),
    "procurementAmount" DECIMAL(12,2),
    "status" "ProcurementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProcurementRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementRecord_bookingId_key" ON "ProcurementRecord"("bookingId");

-- CreateIndex
CREATE INDEX "ProcurementRecord_status_idx" ON "ProcurementRecord"("status");

-- AddForeignKey
ALTER TABLE "ProcurementRecord" ADD CONSTRAINT "ProcurementRecord_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
