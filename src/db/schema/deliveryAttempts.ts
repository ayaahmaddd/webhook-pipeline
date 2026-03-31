import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { subscribers } from "./subscribers";

export const deliveryAttempts = pgTable("delivery_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),

  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),

  subscriberId: uuid("subscriber_id")
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),

  targetUrl: text("target_url").notNull(),

  attemptNumber: integer("attempt_number").notNull(),

  status: text("status").notNull(),

  statusCode: integer("status_code"),

  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});