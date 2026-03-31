import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  webhookKey: text("webhook_key").notNull().unique(),
  actionType: text("action_type").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});