import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines";

export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});