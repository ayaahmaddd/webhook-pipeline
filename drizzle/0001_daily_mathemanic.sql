ALTER TABLE "delivery_attempts" ADD COLUMN "subscriber_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD COLUMN "target_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD COLUMN "status_code" integer;--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_attempts" DROP COLUMN "subscriber_url";--> statement-breakpoint
ALTER TABLE "delivery_attempts" DROP COLUMN "response_status";