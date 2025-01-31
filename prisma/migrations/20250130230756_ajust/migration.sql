/*
  Warnings:

  - You are about to alter the column `name` on the `ProductCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(180)`.
  - You are about to alter the column `description` on the `ProductCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(180)`.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "specialPrice" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ProductCategory" ALTER COLUMN "name" SET DATA TYPE VARCHAR(180),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(180);
