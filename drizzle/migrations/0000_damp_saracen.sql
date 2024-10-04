CREATE TABLE IF NOT EXISTS "exchange_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"api_key" text NOT NULL,
	"api_secret" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"imageUrl" text,
	"user_id" text NOT NULL,
	"editor_state" text
);
