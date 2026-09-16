-- CreateEnum
CREATE TYPE "QueueStage" AS ENUM ('TOKEN_QUEUE', 'QUALITY_CHECK', 'WEIGHTMENT', 'FINALIZATION', 'COMPLETED');

-- CreateTable
CREATE TABLE "queue_states" (
    "id" SERIAL NOT NULL,
    "centerId" INTEGER NOT NULL,
    "currentTokenNumber" TEXT,
    "currentStage" "QueueStage" NOT NULL DEFAULT 'TOKEN_QUEUE',
    "activeCounters" INTEGER NOT NULL DEFAULT 0,
    "totalServedToday" INTEGER NOT NULL DEFAULT 0,
    "totalProcuredToday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "queue_states_centerId_key" ON "queue_states"("centerId");

-- AddForeignKey
ALTER TABLE "queue_states" ADD CONSTRAINT "queue_states_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "ProcurementCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
