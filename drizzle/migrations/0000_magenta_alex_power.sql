CREATE TABLE "medicine_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_email" text NOT NULL,
	"medication_name" text NOT NULL,
	"kind" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"created_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "medicine_reminders_owner_date_idx" ON "medicine_reminders" USING btree ("owner_email","date","time");