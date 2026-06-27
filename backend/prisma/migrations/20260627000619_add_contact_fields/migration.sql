-- AlterTable
ALTER TABLE "children" ADD COLUMN     "cedula" TEXT,
ADD COLUMN     "reporter_type" TEXT,
ADD COLUMN     "rescuer_cedula" TEXT,
ADD COLUMN     "rescuer_phone" TEXT,
ADD COLUMN     "rescuer_whatsapp" TEXT;

-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "phone_home" TEXT,
ADD COLUMN     "whatsapp" TEXT;
