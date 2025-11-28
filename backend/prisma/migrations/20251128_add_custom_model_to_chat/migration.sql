-- AlterTable
ALTER TABLE "Chat" ADD COLUMN "customModelId" TEXT;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_customModelId_fkey" FOREIGN KEY ("customModelId") REFERENCES "CustomModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
