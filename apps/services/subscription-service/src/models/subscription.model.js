import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";

export const paymentStatusEnum = pgEnum("payment_status", ["free", "paid"]);

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),

  user_id: uuid("user_id").notNull(),

  amount: integer("amount").default(2900), // ₹29 → 2900 paise

  paymentStatus: paymentStatusEnum("payment_status").notNull().default("free"),

  razorpay_order_id: varchar("razorpay_order_id"),
  razorpay_payment_id: varchar("razorpay_payment_id"),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const createOrderRecord = async ({
  user_id,
  amount,
  razorpay_order_id,
}) => {
  return await db.insert(subscription).values({
    user_id,
    amount,
    razorpay_order_id,
    paymentStatus: "free",
  });
};

export const markPaymentPaid = async ({
  razorpay_order_id,
  razorpay_payment_id,
}) => {
  return await db
    .update(subscription)
    .set({
      razorpay_payment_id,
      paymentStatus: "paid",
      updated_at: new Date(),
    })
    .where(eq(subscription.razorpay_order_id, razorpay_order_id));
};
