-- AlterTable
ALTER TABLE "children" ADD COLUMN     "registration_gps" TEXT,
ADD COLUMN     "registration_ip" TEXT,
ADD COLUMN     "registration_lang" TEXT,
ADD COLUMN     "registration_meta" JSONB,
ADD COLUMN     "registration_ua" TEXT;
