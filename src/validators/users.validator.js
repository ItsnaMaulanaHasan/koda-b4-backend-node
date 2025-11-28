import { checkSchema } from "express-validator";

export const createUserSchema = checkSchema({
  fullName: {
    notEmpty: {
      errorMessage: "Fullname is required",
    },
    trim: true,
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: "Fullname must be between 3 and 100 characters",
    },
  },

  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Email is not valid",
    },
    normalizeEmail: true,
  },

  password: {
    notEmpty: {
      errorMessage: "Password is required",
    },
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      },
      errorMessage:
        "Password must contain: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character",
    },
  },

  phone: {
    optional: true,
    trim: true,
    isMobilePhone: {
      options: ["id-ID"],
      errorMessage: "Phone number is not valid",
    },
  },

  address: {
    optional: true,
    trim: true,
    isLength: {
      options: { max: 255 },
      errorMessage: "Address must not exceed 255 characters",
    },
  },

  role: {
    optional: true,
    isIn: {
      options: [["customer", "admin"]],
      errorMessage: "Role must be either 'customer' or 'admin'",
    },
  },
});

export const updateUserSchema = checkSchema({
  fullName: {
    optional: true,
    trim: true,
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: "Fullname must be between 3 and 100 characters",
    },
  },

  email: {
    optional: true,
    isEmail: {
      errorMessage: "Email is not valid",
    },
    normalizeEmail: true,
  },

  password: {
    optional: true,
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      },
      errorMessage:
        "Password must contain: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character",
    },
  },

  phone: {
    optional: true,
    trim: true,
    isMobilePhone: {
      options: ["id-ID"],
      errorMessage: "Phone number is not valid",
    },
  },

  address: {
    optional: true,
    trim: true,
    isLength: {
      options: { max: 255 },
      errorMessage: "Address must not exceed 255 characters",
    },
  },

  role: {
    optional: true,
    isIn: {
      options: [["customer", "admin"]],
      errorMessage: "Role must be either 'customer' or 'admin'",
    },
  },
});
