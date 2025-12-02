CREATE TYPE "public"."payment_status" AS ENUM('free', 'paid');--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer DEFAULT 2900,
	"payment_status" "payment_status" DEFAULT 'free' NOT NULL,
	"razorpay_order_id" varchar,
	"razorpay_payment_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
