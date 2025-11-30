import { getAllOrderMethods } from "../models/orderMethod.model.js";

/**
 * @openapi
 * /order-methods:
 *   get:
 *     summary: Get all order methods
 *     tags:
 *       - fees
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve all order methods with delivery fee
 *     responses:
 *       200:
 *         description: Successfully retrieved order methods
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
export async function listOrderMethods(req, res) {
  try {
    const orderMethods = await getAllOrderMethods();

    return res.status(200).json({
      success: true,
      message: "Success get all order methods",
      result: orderMethods,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order methods",
      error: err.message,
    });
  }
}
