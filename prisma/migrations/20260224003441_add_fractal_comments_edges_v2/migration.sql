-- AlterTable
ALTER TABLE "Capture" ADD COLUMN     "assignedTo" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "manualOrder" INTEGER,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "rooting" TEXT,
ADD COLUMN     "scope" TEXT;

-- AlterTable
ALTER TABLE "CaptureConnection" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "actor" TEXT;

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "phase" TEXT NOT NULL DEFAULT 'operation';

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "captureId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'human',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Capture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
