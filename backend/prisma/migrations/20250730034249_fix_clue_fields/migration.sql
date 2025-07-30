-- AlterTable
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "customer_feedback" TEXT;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "customer_room_type" TEXT;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "customer_status" TEXT;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "follow_up_platform" TEXT;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "lead_viewing_status" TEXT;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "source_platform" TEXT;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "source_property_price" REAL;
ALTER TABLE "ai_agent_viewing_records" ADD COLUMN "viewing_properties" TEXT;
