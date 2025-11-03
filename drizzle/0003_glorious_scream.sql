CREATE TYPE "public"."maintenance_status" AS ENUM('Pending', 'In Progress', 'Done');--> statement-breakpoint
CREATE TABLE "maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"type" varchar(100) NOT NULL,
	"status" "maintenance_status" DEFAULT 'Pending' NOT NULL,
	"due_date" date,
	"assigned_to" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
