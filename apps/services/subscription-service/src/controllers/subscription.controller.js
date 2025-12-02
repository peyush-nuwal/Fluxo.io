import * as subscriptionService from "../services/subscription.service.js";
import logger from "../config/logger.js";

export const createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const order = await subscriptionService.createOrder(userId);
    logger.info("Subscription order created successfully", {
      userId,
      orderId: order.id,
    });

    return res.status(201).json(order);
  } catch (error) {
    logger.error("Error while creating subscription order", {
      error: error.message,
    });
    console.error("Error while creating subscription order:", error);
    return res
      .status(500)
      .json({ message: "Failed to create subscription order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, userId } = req.body;

    if (!orderId || !paymentId || !signature || !userId) {
      return res
        .status(400)
        .json({
          message: "orderId, paymentId, signature and userId are required",
        });
    }

    await subscriptionService.verifyPayment({
      orderId,
      paymentId,
      signature,
      userId,
    });

    logger.info("Subscription payment verified successfully", {
      orderId,
      paymentId,
      userId,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error while verifying subscription payment", {
      error: error.message,
    });
    console.error("Error while verifying subscription payment:", error);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
};
