/*
  Warnings:

  - Added the required column `userId` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('pending', 'active', 'deleted');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "status" "AttachmentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "messageId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
