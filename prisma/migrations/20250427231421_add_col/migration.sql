/*
  Warnings:

  - The `pros` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cons` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `birthDate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "level" "Level" NOT NULL,
DROP COLUMN "pros",
ADD COLUMN     "pros" TEXT[],
DROP COLUMN "cons",
ADD COLUMN     "cons" TEXT[];
