import razorpay from "../config/razorpay.js";
import crypto from "crypto";

import {
  createOrderRecord,
  markPaymentPaid,
} from "../models/subscription.model.js";

export const createOrder = async (userId) => {
  const amount = 29 * 100; // Razorpay uses paise

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    payment_capture: 1,
  });

  await createOrderRecord({
    user_id: userId,
    amount,
    razorpay_order_id: order.id,
  });

  return order;
};

export const verifyPayment = async ({
  orderId,
  paymentId,
  signature,
  userId,
}) => {
  const body = orderId + "|" + paymentId;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    throw new Error("Invalid signature");
  }

  await markPaymentPaid(orderId, signature, paymentId, userId);

  return true;
};
