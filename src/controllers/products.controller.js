import {
  getListProductsAdmin,
  getTotalDataProducts,
} from "../models/products.model.js";

/**
 * GET /admin/products
 * @summary Get list of all products
 * @tags admin/products
 * @description Retrieve paginated list of products with optional search filter
 * @security BearerAuth
 * @param {string} search.query - Search products by name
 * @param {number} page.query - Current page number (default: 1)
 * @param {number} limit.query - Number of products per page (default: 10)
 * @return {object} 200 - Successfully retrieved list of products
 * @return {object} 500 - Failed to retrieve list of products
 */
export async function listProductsAdmin(req, res) {
  try {
    const { search = "" } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalData = await getTotalDataProducts(search);
    const listProducts = await getListProductsAdmin(search, page, limit);

    res.json({
      success: true,
      message: "Success get list products",
      result: {
        data: listProducts,
        meta: {
          page,
          limit,
          totalData,
          totalPage: Math.ceil(totalData / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get list users",
      error: err.message,
    });
    return;
  }
}
export async function detailProductAdmin() {}
export async function createProduct() {}
export async function updateProduct() {}
export async function deleteProduct() {}
