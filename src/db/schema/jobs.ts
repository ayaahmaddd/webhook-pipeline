import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  inputPayload: jsonb("input_payload").notNull(),
  processedPayload: jsonb("processed_payload"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});