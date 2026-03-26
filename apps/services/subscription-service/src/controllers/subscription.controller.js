import * as subscriptionService from "../services/subscription.service.js";
import logger from "../config/logger.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 400, "userId is required");
    }

    const order = await subscriptionService.createOrder(userId);
    logger.info("Subscription order created successfully", {
      userId,
      orderId: order.id,
    });

    return sendSuccess(res, 201, "Subscription order created successfully", {
      order,
    });
  } catch (error) {
    logger.error("Error while creating subscription order", {
      error: error.message,
    });
    console.error("Error while creating subscription order:", error);
    return sendError(res, 500, "Failed to create subscription order");
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, userId } = req.body;

    if (!orderId || !paymentId || !signature || !userId) {
      return sendError(
        res,
        400,
        "orderId, paymentId, signature and userId are required",
      );
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
    return sendSuccess(res, 200, "Subscription payment verified successfully");
  } catch (error) {
    logger.error("Error while verifying subscription payment", {
      error: error.message,
    });
    console.error("Error while verifying subscription payment:", error);
    return sendError(res, 500, "Failed to verify payment");
  }
};
