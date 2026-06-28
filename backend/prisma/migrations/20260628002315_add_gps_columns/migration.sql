/*
  Warnings:

  - You are about to drop the column `registration_gps` on the `children` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "children" DROP COLUMN "registration_gps",
ADD COLUMN     "registration_gps_browser" TEXT,
ADD COLUMN     "registration_gps_ip" TEXT;
