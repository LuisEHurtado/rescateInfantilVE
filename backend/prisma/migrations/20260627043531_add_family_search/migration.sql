-- CreateEnum
CREATE TYPE "FamilySearchStatus" AS ENUM ('ACTIVE', 'REVIEWING', 'MATCHED', 'CLOSED');

-- CreateTable
CREATE TABLE "family_searches" (
    "id" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "contact_whatsapp" TEXT,
    "contact_email" TEXT,
    "relationship" TEXT NOT NULL,
    "child_name" TEXT,
    "child_sex" "Sex" NOT NULL DEFAULT 'UNDETERMINED',
    "child_age_min" INTEGER,
    "child_age_max" INTEGER,
    "child_state" TEXT,
    "child_municipality" TEXT,
    "skin_color" TEXT,
    "hair_color" TEXT,
    "eye_color" TEXT,
    "special_marks" TEXT,
    "last_seen_at" TIMESTAMP(3),
    "last_seen_place" TEXT,
    "circumstances" TEXT,
    "observations" TEXT,
    "status" "FamilySearchStatus" NOT NULL DEFAULT 'ACTIVE',
    "admin_notes" TEXT,
    "resolved_child_id" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "family_searches_status_idx" ON "family_searches"("status");

-- CreateIndex
CREATE INDEX "family_searches_created_at_idx" ON "family_searches"("created_at");

-- AddForeignKey
ALTER TABLE "family_searches" ADD CONSTRAINT "family_searches_resolved_child_id_fkey" FOREIGN KEY ("resolved_child_id") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;
