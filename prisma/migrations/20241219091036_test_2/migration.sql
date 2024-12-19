/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Role` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_organizationId_fkey";

-- DropIndex
DROP INDEX "Role_organizationId_idx";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "organizationId";
