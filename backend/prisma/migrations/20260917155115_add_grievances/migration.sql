-- CreateEnum
CREATE TYPE "GrievanceIssueType" AS ENUM ('PAYMENT', 'QUALITY', 'WEIGHTMENT', 'SLOT', 'STAFF', 'OTHER');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Grievance" (
    "id" SERIAL NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "issueType" "GrievanceIssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grievance_grievanceId_key" ON "Grievance"("grievanceId");

-- CreateIndex
CREATE INDEX "Grievance_userId_createdAt_idx" ON "Grievance"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Grievance_bookingId_idx" ON "Grievance"("bookingId");

-- CreateIndex
CREATE INDEX "Grievance_issueType_idx" ON "Grievance"("issueType");

-- CreateIndex
CREATE INDEX "Grievance_status_idx" ON "Grievance"("status");

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
