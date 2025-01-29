-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_organizationId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR(36);

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
