import { getListFavouriteProducts } from "../models/products.model.js";

/**
 * @openapi
 * /products/favourites:
 *   get:
 *     summary: Get favourite products
 *     tags:
 *       - products (public)
 *     description: Retrieve a list of favourite products with optional limit parameter.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         required: false
 *         example: 4
 *         description: Number of products to return (default 4, max 20)
 *     responses:
 *       200:
 *         description: Successfully retrieved favourite products
 *       400:
 *         description: Invalid limit value
 *       500:
 *         description: Internal server error
 */
export async function favouriteProducts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 4;

    if (limit < 1) {
      res.status(400).json({
        success: false,
        message: "Limit must be greater than 0",
      });
      return;
    }

    if (limit > 20) {
      res.status(400).json({
        success: false,
        message: "Limit cannot exceed 20",
      });
      return;
    }

    const products = await getListFavouriteProducts(limit);

    res.status(200).json({
      success: true,
      message: "Success get all favourite products",
      data: products,
      limit: limit,
    });
  } catch (err) {
    console.error("Error in listFavouriteProducts:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favourite products from database",
      error: err.message,
    });
  }
}

import { getDetailProductPublic } from "../models/products.model.js";

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get product by Id
 *     tags:
 *       - products
 *     description: Retrieving product data based on Id for public
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved product
 *       400:
 *         description: Invalid Id format
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error while fetching products from database
 */
export async function detailProductPublic(req, res) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid Id format",
      });
      return;
    }

    const product = await getDetailProductPublic(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Success get detail product",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get detail product",
      error: err.message,
    });
  }
}
