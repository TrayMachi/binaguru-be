/*
  Warnings:

  - You are about to drop the column `classLevel` on the `RPP` table. All the data in the column will be lost.
  - Changed the type of `level` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `level` to the `RPP` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('TK_A', 'TK_B', 'SD_Kelas_1', 'SD_Kelas_2', 'SD_Kelas_3', 'SD_Kelas_4', 'SD_Kelas_5', 'SD_Kelas_6', 'SMP_Kelas_7', 'SMP_Kelas_8', 'SMP_Kelas_9', 'SMA_Kelas_10', 'SMA_Kelas_11', 'SMA_Kelas_12', 'SMK_Kelas_10', 'SMK_Kelas_11', 'SMK_Kelas_12', 'D3_Semester_1', 'D3_Semester_2', 'D3_Semester_3', 'D3_Semester_4', 'D3_Semester_5', 'D3_Semester_6', 'S1_Semester_1', 'S1_Semester_2', 'S1_Semester_3', 'S1_Semester_4', 'S1_Semester_5', 'S1_Semester_6', 'S1_Semester_7', 'S1_Semester_8', 'S2_Semester_1', 'S2_Semester_2', 'S2_Semester_3', 'S2_Semester_4', 'Umum');

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "level",
ADD COLUMN     "level" "Level" NOT NULL;

-- AlterTable
ALTER TABLE "RPP" DROP COLUMN "classLevel",
ADD COLUMN     "level" "Level" NOT NULL;
