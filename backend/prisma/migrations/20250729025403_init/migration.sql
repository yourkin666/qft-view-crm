-- AlterTable
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "deleted_at" DATETIME;

-- CreateIndex
CREATE INDEX "idx_deleted_at" ON "ai_agent_viewing_records"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_status_agent" ON "ai_agent_viewing_records"("viewing_status", "agent_id");

-- CreateIndex
CREATE INDEX "idx_created_status" ON "ai_agent_viewing_records"("created_at", "viewing_status");

-- CreateIndex
CREATE INDEX "idx_source_apikey" ON "ai_agent_viewing_records"("source", "api_key_id");

-- CreateIndex
CREATE INDEX "idx_agent_created" ON "ai_agent_viewing_records"("agent_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_status_created" ON "ai_agent_viewing_records"("viewing_status", "created_at");

-- CreateIndex
CREATE INDEX "idx_primary_phone" ON "ai_agent_viewing_records"("primary_phone");

-- CreateIndex
CREATE INDEX "idx_tenant_name" ON "ai_agent_viewing_records"("tenant_name");

-- CreateIndex
CREATE INDEX "idx_apikey_active" ON "api_keys"("is_active");

-- CreateIndex
CREATE INDEX "idx_channel_name" ON "api_keys"("channel_name");

-- CreateIndex
CREATE INDEX "idx_apikey_creator" ON "api_keys"("created_by");

-- CreateIndex
CREATE INDEX "idx_property_name" ON "properties"("name");

-- CreateIndex
CREATE INDEX "idx_property_address" ON "properties"("address");

-- CreateIndex
CREATE INDEX "idx_role_name" ON "roles"("name");

-- CreateIndex
CREATE INDEX "idx_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_phone" ON "users"("phone");

-- CreateIndex
CREATE INDEX "idx_active_role" ON "users"("is_active", "role_id");

-- CreateIndex
CREATE INDEX "idx_user_created" ON "users"("created_at");
