import { getAllPaymentMethods } from "../models/paymentMethod.model.js";

/**
 * @openapi
 * /payment-methods:
 *   get:
 *     summary: Get all payment methods
 *     tags:
 *       - fees
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve all payment methods with admin fee
 *     responses:
 *       200:
 *         description: Successfully retrieved payment methods
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
export async function listPaymentMethods(req, res) {
  try {
    const paymentMethods = await getAllPaymentMethods();

    return res.status(200).json({
      success: true,
      message: "Success get all payment methods",
      result: paymentMethods,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
      error: err.message,
    });
  }
}
