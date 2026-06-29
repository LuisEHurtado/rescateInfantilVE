-- AlterTable: add status column to children, default 1 for all existing rows
ALTER TABLE "children" ADD COLUMN "status" INTEGER NOT NULL DEFAULT 1;
