CREATE TYPE "public"."property_status" AS ENUM('available', 'occupied', 'under_maintenance');--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"rent_amount" numeric(10, 2) NOT NULL,
	"status" "property_status" DEFAULT 'available' NOT NULL,
	"tenant_name" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
