import { buildHateoasPagination } from "../lib/hateoasBuilder.js";
import {
  getDetailProductPublic,
  getListFavouriteProducts,
  getListProductsPublic,
  totalDataProductsPublic,
} from "../models/products.model.js";

/**
 * @openapi
 * /favourite-products:
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

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Get list products for public
 *     tags:
 *       - products
 *     description: Retrieving list products with filter
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search name product
 *         required: false
 *         schema:
 *           type: string
 *       - name: cat
 *         in: query
 *         description: Category of product (can be multiple)
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *       - name: sort[name]
 *         in: query
 *         description: Sort by name
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - name: sort[price]
 *         in: query
 *         description: Sort by price
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - name: maxprice
 *         in: query
 *         description: Maximum price product
 *         required: false
 *         schema:
 *           type: number
 *       - name: minprice
 *         in: query
 *         description: Minimum price product
 *         required: false
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved product list
 *       400:
 *         description: Invalid pagination parameters or page out of range
 *       500:
 *         description: Internal server error
 */
export async function listProductsPublic(req, res) {
  try {
    const search = req.query.q || "";
    const cat = req.query.cat
      ? Array.isArray(req.query.cat)
        ? req.query.cat
        : [req.query.cat]
      : [];
    const sortName = req.query["sort[name]"] || "";
    const sortPrice = req.query["sort[price]"] || "";
    const maxPrice = parseFloat(req.query.maxprice) || 0;
    const minPrice = parseFloat(req.query.minprice) || 0;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'page' must be greater than 0",
      });
      return;
    }

    if (limit < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' must be greater than 0",
      });
      return;
    }

    if (limit > 100) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' cannot exceed 100",
      });
      return;
    }

    let sortField = "";
    if (sortName) {
      sortField =
        sortName === "asc"
          ? "name_asc"
          : sortName === "desc"
          ? "name_desc"
          : "";
    } else if (sortPrice) {
      sortField =
        sortPrice === "asc"
          ? "price_asc"
          : sortPrice === "desc"
          ? "price_desc"
          : "";
    }

    const totalData = await totalDataProductsPublic(
      search,
      cat,
      maxPrice,
      minPrice
    );

    const totalPages = Math.ceil(totalData / limit);

    if (page > totalPages && totalPages > 0) {
      res.status(400).json({
        success: false,
        message: "Page is out of range",
      });
      return;
    }

    const products = await getListProductsPublic(
      search,
      cat,
      sortField,
      maxPrice,
      minPrice,
      limit,
      page
    );

    const links = buildHateoasPagination(req, page, limit, totalData);

    res.status(200).json({
      success: true,
      message: "Success get all product",
      data: products,
      _links: links,
      meta: {
        currentPage: page,
        perPage: limit,
        totalData: totalData,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get list products",
      error: err.message,
    });
  }
}

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
