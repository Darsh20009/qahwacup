CREATE TABLE "card_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(12) NOT NULL,
	"issued_for_order_id" varchar NOT NULL,
	"drink_name" text NOT NULL,
	"is_redeemed" integer DEFAULT 0 NOT NULL,
	"redeemed_at" timestamp,
	"redeemed_by_card_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "card_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"coffee_item_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coffee_item_ingredients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coffee_item_id" varchar NOT NULL,
	"ingredient_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coffee_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"old_price" numeric(10, 2),
	"category" varchar(50) NOT NULL,
	"image_url" text,
	"is_available" integer DEFAULT 1 NOT NULL,
	"availability_status" varchar(20) DEFAULT 'available',
	"coffee_strength" varchar(20) DEFAULT 'classic',
	"strength_level" integer
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"discount_percentage" integer NOT NULL,
	"reason" text NOT NULL,
	"employee_id" varchar NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text,
	"is_available" integer DEFAULT 1 NOT NULL,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_cards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text,
	"phone_number" varchar(20) NOT NULL,
	"qr_token" varchar(100) NOT NULL,
	"card_number" varchar(20) NOT NULL,
	"stamps" integer DEFAULT 0 NOT NULL,
	"free_cups_earned" integer DEFAULT 0 NOT NULL,
	"free_cups_redeemed" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"tier" varchar(20) DEFAULT 'bronze' NOT NULL,
	"total_spent" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_cards_qr_token_unique" UNIQUE("qr_token"),
	CONSTRAINT "loyalty_cards_card_number_unique" UNIQUE("card_number")
);
--> statement-breakpoint
CREATE TABLE "loyalty_rewards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text,
	"description" text NOT NULL,
	"points_cost" integer NOT NULL,
	"discount_percentage" numeric(5, 2),
	"discount_amount" numeric(10, 2),
	"tier" varchar(20),
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar NOT NULL,
	"order_id" varchar,
	"type" varchar(20) NOT NULL,
	"points_change" integer NOT NULL,
	"discount_amount" numeric(10, 2),
	"order_amount" numeric(10, 2),
	"description" text,
	"employee_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"coffee_item_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(20) NOT NULL,
	"items" jsonb NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"customer_info" jsonb,
	"customer_id" varchar,
	"employee_id" varchar,
	"customer_notes" text,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "card_codes" ADD CONSTRAINT "card_codes_issued_for_order_id_orders_id_fk" FOREIGN KEY ("issued_for_order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_codes" ADD CONSTRAINT "card_codes_redeemed_by_card_id_loyalty_cards_id_fk" FOREIGN KEY ("redeemed_by_card_id") REFERENCES "loyalty_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_coffee_item_id_coffee_items_id_fk" FOREIGN KEY ("coffee_item_id") REFERENCES "coffee_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coffee_item_ingredients" ADD CONSTRAINT "coffee_item_ingredients_coffee_item_id_coffee_items_id_fk" FOREIGN KEY ("coffee_item_id") REFERENCES "coffee_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coffee_item_ingredients" ADD CONSTRAINT "coffee_item_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_card_id_loyalty_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "loyalty_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_coffee_item_id_coffee_items_id_fk" FOREIGN KEY ("coffee_item_id") REFERENCES "coffee_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE no action ON UPDATE no action;