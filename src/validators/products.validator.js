import { checkSchema } from "express-validator";

export const createProductSchema = checkSchema({
  name: {
    notEmpty: {
      errorMessage: "Product name is required",
    },
    trim: true,
    isLength: {
      options: { max: 255 },
      errorMessage: "Product name must not exceed 255 characters",
    },
  },

  description: {
    notEmpty: {
      errorMessage: "Product description is required",
    },
    trim: true,
  },

  price: {
    notEmpty: {
      errorMessage: "Product price is required",
    },
    isFloat: {
      options: { min: 0.01 },
      errorMessage: "Product price must be greater than 0",
    },
    toFloat: true,
  },

  discountPercent: {
    optional: true,
    isFloat: {
      options: { min: 0, max: 100 },
      errorMessage: "Discount percent must be between 0 and 100",
    },
    toFloat: true,
  },

  rating: {
    optional: true,
    isFloat: {
      options: { min: 0, max: 5 },
      errorMessage: "Rating must be between 0 and 5",
    },
    toFloat: true,
  },

  stock: {
    notEmpty: {
      errorMessage: "Stock is required",
    },
    isInt: {
      options: { min: 0 },
      errorMessage: "Stock must be a non-negative integer",
    },
    toInt: true,
  },

  isFlashSale: {
    optional: true,
    isBoolean: {
      errorMessage: "isFlashSale must be a boolean",
    },
    toBoolean: true,
  },

  isActive: {
    optional: true,
    isBoolean: {
      errorMessage: "isActive must be a boolean",
    },
    toBoolean: true,
  },

  isFavourite: {
    optional: true,
    isBoolean: {
      errorMessage: "isFavourite must be a boolean",
    },
    toBoolean: true,
  },

  sizeProducts: {
    optional: true,
    custom: {
      options: (value) => {
        if (!value) return true;
        const ids = value.split(",").map((id) => id.trim());
        return ids.every((id) => /^\d+$/.test(id));
      },
      errorMessage:
        "sizeProducts must be comma-separated numbers (e.g., 1,2,3)",
    },
  },

  productCategories: {
    optional: true,
    custom: {
      options: (value) => {
        if (!value) return true;
        const ids = value.split(",").map((id) => id.trim());
        return ids.every((id) => /^\d+$/.test(id));
      },
      errorMessage:
        "productCategories must be comma-separated numbers (e.g., 1,2,3)",
    },
  },

  productVariants: {
    optional: true,
    custom: {
      options: (value) => {
        if (!value) return true;
        const ids = value.split(",").map((id) => id.trim());
        return ids.every((id) => /^\d+$/.test(id));
      },
      errorMessage:
        "productVariants must be comma-separated numbers (e.g., 1,2,3)",
    },
  },
});
