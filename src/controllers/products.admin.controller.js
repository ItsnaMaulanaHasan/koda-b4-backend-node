import { validationResult } from "express-validator";
import fs from "fs";
import { MulterError } from "multer";
import { deleteFileIfExists, getProductFilePath } from "../lib/fileHelper.js";
import upload from "../lib/upload.js";
import {
  checkProductName,
  checkProductNameForUpdate,
  createDataProduct,
  deleteDataProduct,
  getDetailProduct,
  getListProductsAdmin,
  getTotalDataProducts,
  updateDataProduct,
} from "../models/products.model.js";

/**
 * @openapi
 * /admin/products:
 *   get:
 *     summary: Get list of all products
 *     tags:
 *       - admin/products
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve paginated list of products with optional search filter
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search products by name
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Current page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved list of products
 *       500:
 *         description: Failed to retrieve list products
 */
export async function listProductsAdmin(req, res) {
  try {
    const { search = "" } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

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
 * @openapi
 * /admin/products/{id}:
 *   get:
 *     summary: Get product detail by Id
 *     tags:
 *       - admin/products
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve detail information of a product by Id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success get detail product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
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
 * @openapi
 * /admin/products:
 *   post:
 *     summary: Create product
 *     tags:
 *       - admin/products
 *     security:
 *       - BearerAuth: []
 *     description: Create a new product with images, sizes, categories, and variants
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error or upload error
 *       409:
 *         description: Product name already exists
 *       500:
 *         description: Internal server error
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
        res.status(409).json({
          success: false,
          message: "Product name already exists",
        });
        return;
      }

      const userId = req.user.id;
      if (!userId) {
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

/**
 * @openapi
 * /admin/products/{id}:
 *   patch:
 *     summary: Update product
 *     tags:
 *       - admin/products
 *     security:
 *       - BearerAuth: []
 *     description: Update an existing product with optional images and related data
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error or upload error
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product name already exists
 *       500:
 *         description: Internal server error
 */
export async function updateProduct(req, res) {
  upload.array("fileImages", 4)(req, res, async function (err) {
    const uploadedFiles = req.files || [];
    let oldImages = [];

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

      const productId = Number(req.params.id);
      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid product Id",
        });
        return;
      }

      const result = validationResult(req);
      if (!result.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Please provide valid product data",
          error: result.array(),
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

      oldImages = existingProduct.productImages || [];

      if (req.body.name && req.body.name !== existingProduct.name) {
        const nameExists = await checkProductNameForUpdate(
          req.body.name,
          productId
        );
        if (nameExists) {
          res.status(409).json({
            success: false,
            message: "Product name already exists",
          });
          return;
        }
      }

      const userId = req.user.id;
      if (!userId) {
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
        : undefined;

      const categoryIds = req.body.productCategories
        ? req.body.productCategories
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : undefined;

      const variantIds = req.body.productVariants
        ? req.body.productVariants
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : undefined;

      const productData = {
        name: req.body.name || existingProduct.name,
        description: req.body.description || existingProduct.description,
        price: req.body.price
          ? parseFloat(req.body.price)
          : existingProduct.price,
        discountPercent: req.body.discountPercent
          ? parseFloat(req.body.discountPercent)
          : existingProduct.discountPercent,
        rating: req.body.rating
          ? parseFloat(req.body.rating)
          : existingProduct.rating,
        stock: req.body.stock
          ? parseInt(req.body.stock)
          : existingProduct.stock,
        isFlashSale:
          req.body.isFlashSale !== undefined
            ? req.body.isFlashSale === "true" || req.body.isFlashSale === true
            : existingProduct.isFlashSale,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === "true" || req.body.isActive === true
            : existingProduct.isActive,
        isFavourite:
          req.body.isFavourite !== undefined
            ? req.body.isFavourite === "true" || req.body.isFavourite === true
            : existingProduct.isFavourite,
      };

      await updateDataProduct(
        productId,
        productData,
        uploadedFiles.length > 0 ? uploadedFiles : null,
        sizeIds,
        categoryIds,
        variantIds,
        userId
      );

      if (uploadedFiles.length > 0 && oldImages.length > 0) {
        oldImages.forEach((imageUrl) => {
          const filePath = getProductFilePath(imageUrl);
          deleteFileIfExists(filePath);
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
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
        message: "Failed to update product",
        error: err.message,
      });
    }
  });
}

/**
 * @openapi
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags:
 *       - admin/products
 *     security:
 *       - BearerAuth: []
 *     description: Delete product permanently
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
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
