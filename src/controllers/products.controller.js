import { validationResult } from "express-validator";
import fs from "fs";
import { MulterError } from "multer";
import { deleteFileIfExists, getProductFilePath } from "../lib/fileHelper.js";
import upload from "../lib/upload.js";
import {
  checkProductName,
  createDataProduct,
  deleteDataProduct,
  getDetailProduct,
  getListProductsAdmin,
  getTotalDataProducts,
} from "../models/products.model.js";

/**
 * Create product request body
 * @typedef {object} CreateProductRequest
 * @property {array<string>} fileImages - Product images (max 4 files) - binary
 * @property {string} name.required - Product name - eg: Americano
 * @property {string} description.required - Product description - eg: Classic black coffee
 * @property {number} price.required - Product price - eg: 25000
 * @property {number} discountPercent - Discount percentage (0-100) - eg: 10
 * @property {number} rating - Product rating (0-5) - eg: 5
 * @property {integer} stock.required - Product stock - eg: 100
 * @property {boolean} isFlashSale - Is flash sale product - eg: false
 * @property {boolean} isActive - Is active product - eg: true
 * @property {boolean} isFavourite - Is favourite product - eg: false
 * @property {string} sizeProducts - Size IDs (comma-separated) - eg: 1,2,3
 * @property {string} productCategories - Category IDs (comma-separated) - eg: 1,2
 * @property {string} productVariants - Variant IDs (comma-separated) - eg: 1,2
 */

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
      message: "Failed to get list products",
      error: err.message,
    });
  }
}

/**
 * GET /admin/products/{id}
 * @summary Get product detail by Id
 * @tags admin/products
 * @description Retrieve detail information of a product by their unique Id
 * @security BearerAuth
 * @param {number} id.path.required - Id of the product
 * @return {object} 200 - Success get detail of product
 * @return {object} 404 - Product not found
 * @return {object} 500 - Internal server error
 */
export async function detailProductAdmin(req, res) {
  try {
    const { id } = req.params;
    const product = await getDetailProduct(Number(id));

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Success get detail product",
      result: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get detail product",
      error: err.message,
    });
  }
}

/**
 * POST /admin/products
 * @summary Create product
 * @tags admin/products
 * @description Create a new product with multiple images, sizes, categories, and variants
 * @security BearerAuth
 * @param {CreateProductRequest} request.body.required - Product data - multipart/form-data
 * @return {object} 201 - Create product success
 * @return {object} 400 - Validation error or upload error
 * @return {object} 409 - Product name already exists
 * @return {object} 500 - Internal server error
 */
export async function createProduct(req, res) {
  upload.array("fileImages", 4)(req, res, async function (err) {
    const uploadedFiles = req.files || [];
    try {
      if (err instanceof MulterError) {
        res.status(400).json({
          success: false,
          message: "Failed to upload product images",
          error: err.message,
        });
        return;
      } else if (err) {
        res.status(400).json({
          success: false,
          message: "Failed to upload product images",
          error: err.message,
        });
        return;
      }

      const result = validationResult(req);
      if (!result.isEmpty()) {
        uploadedFiles.forEach((file) => {
          fs.unlinkSync(file.path);
        });

        res.status(400).json({
          success: false,
          message: "Please provide valid product data",
          error: result.array(),
        });
        return;
      }

      if (uploadedFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: "At least one product image is required",
        });
        return;
      }

      const exists = await checkProductName(req.body.name);
      if (exists) {
        uploadedFiles.forEach((file) => {
          fs.unlinkSync(file.path);
        });

        res.status(409).json({
          success: false,
          message: "Product name already exists",
        });
        return;
      }

      const userId = req.user.id;
      if (!userId) {
        uploadedFiles.forEach((file) => {
          fs.unlinkSync(file.path);
        });

        res.status(401).json({
          success: false,
          message: "User Id not found in token",
        });
        return;
      }

      const sizeIds = req.body.sizeProducts
        ? req.body.sizeProducts
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

      const categoryIds = req.body.productCategories
        ? req.body.productCategories
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

      const variantIds = req.body.productVariants
        ? req.body.productVariants
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        discountPercent: req.body.discountPercent
          ? parseFloat(req.body.discountPercent)
          : 0,
        rating: req.body.rating ? parseFloat(req.body.rating) : 5,
        stock: parseInt(req.body.stock),
        isFlashSale:
          req.body.isFlashSale === "true" || req.body.isFlashSale === true,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === "true" || req.body.isActive === true
            : true,
        isFavourite:
          req.body.isFavourite === "true" || req.body.isFavourite === true,
      };

      await createDataProduct(
        productData,
        uploadedFiles,
        sizeIds,
        categoryIds,
        variantIds,
        userId
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
      });
    } catch (err) {
      uploadedFiles.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error("Failed to delete file:", file.path, unlinkErr);
        }
      });

      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: err.message,
      });
    }
  });
}

export async function updateProduct() {}

/**
 * DELETE /admin/products/{id}
 * @summary Delete product
 * @tags admin/products
 * @description Delete product permanently from the system
 * @security BearerAuth
 * @param {number} id.path.required - Id of the product
 * @return {object} 200 - Delete product success
 * @return {object} 404 - Product not found
 * @return {object} 500 - Internal server error
 */
export async function deleteProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid product Id",
      });
      return;
    }

    const existingProduct = await getDetailProduct(productId);
    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    await deleteDataProduct(productId);

    existingProduct.productImages.forEach((imageUrl) => {
      console.log("image url:", imageUrl);
      const filePath = getProductFilePath(imageUrl);
      deleteFileIfExists(filePath);
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: err.message,
    });
  }
}
