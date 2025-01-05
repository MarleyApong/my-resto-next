-- AlterTable
ALTER TABLE "User" ALTER COLUMN "temporyPassword" DROP NOT NULL,
ALTER COLUMN "expiryPassword" DROP NOT NULL;
