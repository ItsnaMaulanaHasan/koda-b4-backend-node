import { addToCart, getListCart } from "../models/carts.model.js";

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

/**
 * @openapi
 * /carts:
 *   post:
 *     summary: Add new cart
 *     tags:
 *       - carts
 *     security:
 *       - BearerAuth: []
 *     description: Add a new cart to list carts of user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - sizeId
 *               - variantId
 *               - amount
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               sizeId:
 *                 type: integer
 *                 example: 2
 *               variantId:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Cart added successfully
 *       400:
 *         description: Invalid request body or validation error
 *       401:
 *         description: User unauthorized
 *       500:
 *         description: Internal server error
 */
export async function addCart(req, res) {
  try {
    const { productId, sizeId, variantId, amount } = req.body;

    if (!productId || !sizeId || !variantId || !amount) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON body",
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User Id not found in token",
      });
      return;
    }

    const bodyAdd = {
      userId: userId,
      productId: Number(productId),
      sizeId: Number(sizeId),
      variantId: Number(variantId),
      amount: Number(amount),
    };

    const responseCart = await addToCart(bodyAdd);

    res.status(201).json({
      success: true,
      message: "Cart added successfully",
      data: responseCart,
    });
  } catch (err) {
    if (
      err.message === "Invalid amount, must be greater than 0" ||
      err.message === "Amount exceeds available stock"
    ) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to add cart",
      error: err.message,
    });
  }
}

export async function deleteCart() {}
