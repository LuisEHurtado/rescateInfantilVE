-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESCUER', 'HOSPITAL', 'VIEWER');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'UNDETERMINED');

-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('UNIDENTIFIED', 'PARTIAL', 'IDENTIFIED', 'REUNIFIED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('UNIDENTIFIED', 'PARTIAL_IDENTITY', 'IDENTIFIED', 'HOSPITALIZED', 'IN_OBSERVATION', 'TRANSFERRED', 'REUNIFIED', 'DECEASED');

-- CreateEnum
CREATE TYPE "FamilyVerifyStatus" AS ENUM ('UNVERIFIED', 'IN_PROCESS', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('REGISTERED', 'FOUND_LOCATION_SET', 'TRANSFER', 'MEDICAL_ADMISSION', 'MEDICAL_UPDATE', 'MEDICAL_DISCHARGE', 'PHOTO_ADDED', 'IDENTITY_UPDATED', 'FAMILY_ADDED', 'FAMILY_VERIFIED', 'STATUS_CHANGED', 'REUNIFICATION', 'NOTE_ADDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "email" TEXT,
    "organization" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "first_name" TEXT,
    "second_name" TEXT,
    "last_name" TEXT,
    "nickname" TEXT,
    "sex" "Sex" NOT NULL DEFAULT 'UNDETERMINED',
    "approximate_age" INTEGER,
    "birth_date_est" TIMESTAMP(3),
    "nationality" TEXT DEFAULT 'Venezolana',
    "identity_status" "IdentityStatus" NOT NULL DEFAULT 'UNIDENTIFIED',
    "case_status" "CaseStatus" NOT NULL DEFAULT 'UNIDENTIFIED',
    "registered_by_id" TEXT,
    "rescue_org" TEXT,
    "rescuer_name" TEXT,
    "rescued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observations" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "skin_color" TEXT,
    "eye_color" TEXT,
    "hair_color" TEXT,
    "height_cm" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "build" TEXT,
    "special_marks" TEXT,
    "scars" TEXT,
    "birthmarks" TEXT,
    "physical_obs" TEXT,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "find_locations" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "parish" TEXT,
    "sector" TEXT,
    "address" TEXT,
    "gps_lat" DOUBLE PRECISION,
    "gps_lng" DOUBLE PRECISION,
    "found_at" TIMESTAMP(3) NOT NULL,
    "rescue_org" TEXT,
    "rescuer_name" TEXT,
    "photo_url" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "find_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_locations" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "area" TEXT,
    "bed_number" TEXT,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departed_at" TIMESTAMP(3) NOT NULL,
    "arrived_at" TIMESTAMP(3),
    "reason" TEXT,
    "transport" TEXT,
    "responsible" TEXT,
    "observations" TEXT,
    "registered_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "uploaded_by_id" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "admitted_at" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT,
    "health_status" TEXT,
    "doctor" TEXT,
    "treatment" TEXT,
    "discharged_at" TIMESTAMP(3),
    "observations" TEXT,
    "registered_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "verify_status" "FamilyVerifyStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "observations" TEXT,
    "registered_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "event_type" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "metadata" JSONB,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "child_id" TEXT,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "child_id" TEXT,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_tokens_token_key" ON "emergency_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "children_code_key" ON "children"("code");

-- CreateIndex
CREATE INDEX "children_code_idx" ON "children"("code");

-- CreateIndex
CREATE INDEX "children_case_status_idx" ON "children"("case_status");

-- CreateIndex
CREATE INDEX "children_identity_status_idx" ON "children"("identity_status");

-- CreateIndex
CREATE INDEX "children_sex_idx" ON "children"("sex");

-- CreateIndex
CREATE INDEX "children_rescued_at_idx" ON "children"("rescued_at");

-- CreateIndex
CREATE UNIQUE INDEX "find_locations_child_id_key" ON "find_locations"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "current_locations_child_id_key" ON "current_locations"("child_id");

-- CreateIndex
CREATE INDEX "transfers_child_id_idx" ON "transfers"("child_id");

-- CreateIndex
CREATE INDEX "photos_child_id_idx" ON "photos"("child_id");

-- CreateIndex
CREATE INDEX "medical_records_child_id_idx" ON "medical_records"("child_id");

-- CreateIndex
CREATE INDEX "family_members_child_id_idx" ON "family_members"("child_id");

-- CreateIndex
CREATE INDEX "family_members_document_idx" ON "family_members"("document");

-- CreateIndex
CREATE INDEX "timeline_events_child_id_idx" ON "timeline_events"("child_id");

-- CreateIndex
CREATE INDEX "timeline_events_occurred_at_idx" ON "timeline_events"("occurred_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_child_id_idx" ON "audit_logs"("child_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_child_id_idx" ON "notifications"("child_id");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "find_locations" ADD CONSTRAINT "find_locations_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_locations" ADD CONSTRAINT "current_locations_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
