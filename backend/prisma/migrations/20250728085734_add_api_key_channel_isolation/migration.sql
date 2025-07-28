-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "role_id" INTEGER NOT NULL,
    CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channel_name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "api_secret_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" INTEGER NOT NULL,
    CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "properties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_agent_viewing_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenant_name" TEXT,
    "session_id" TEXT,
    "requirements_json" TEXT,
    "original_query" TEXT,
    "ai_summary" TEXT,
    "primary_phone" TEXT,
    "primary_wechat" TEXT,
    "viewing_date" DATETIME,
    "room_id" INTEGER,
    "business_type" TEXT,
    "property_name" TEXT,
    "room_address" TEXT,
    "preferred_viewing_time" TEXT,
    "viewing_status" TEXT NOT NULL DEFAULT 'pending',
    "agent_id" INTEGER,
    "agent_name" TEXT,
    "agent_phone" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "api_key_id" INTEGER,
    "remarks" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ai_agent_viewing_records_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ai_agent_viewing_records_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "properties" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ai_agent_viewing_records_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_api_key_key" ON "api_keys"("api_key");

-- CreateIndex
CREATE INDEX "idx_session_id" ON "ai_agent_viewing_records"("session_id");

-- CreateIndex
CREATE INDEX "idx_viewing_status" ON "ai_agent_viewing_records"("viewing_status");

-- CreateIndex
CREATE INDEX "idx_agent_id" ON "ai_agent_viewing_records"("agent_id");

-- CreateIndex
CREATE INDEX "idx_api_key_id" ON "ai_agent_viewing_records"("api_key_id");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "ai_agent_viewing_records"("created_at");
