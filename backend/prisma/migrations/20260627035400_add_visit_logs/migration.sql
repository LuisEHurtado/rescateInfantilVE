-- CreateTable
CREATE TABLE "visit_logs" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "search_query" TEXT,
    "filters" JSONB,
    "is_mobile" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visit_logs_created_at_idx" ON "visit_logs"("created_at");

-- CreateIndex
CREATE INDEX "visit_logs_ip_idx" ON "visit_logs"("ip");
