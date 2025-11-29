import { getListCart } from "../models/carts.model";

/**
 * @openapi
 * /carts:
 *   get:
 *     summary: Get list carts
 *     tags:
 *       - carts
 *     security:
 *       - BearerAuth: []
 *     description: Retrieving list cart by user id
 *     responses:
 *       200:
 *         description: Successfully retrieved carts list
 *       401:
 *         description: User unauthorized
 *       500:
 *         description: Internal server error
 */
export async function listCarts(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User Id not found in token",
      });
      return;
    }

    const carts = await getListCart(userId);

    res.status(200).json({
      success: true,
      message: "Success get list carts",
      data: carts,
    });
  } catch (err) {
    console.error("Error in listCarts:", err);

    let message =
      "Internal server error while fetching or processing carts data";
    if (err.message.includes("fetch")) {
      message = "Failed to fetch list carts from database";
    } else if (err.message.includes("process")) {
      message = "Failed to process carts data from database";
    }

    res.status(500).json({
      success: false,
      message: message,
      error: err.message,
    });
  }
}

export async function addCart() {}

export async function deleteCart() {}
