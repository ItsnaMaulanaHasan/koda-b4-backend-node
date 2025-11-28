import { checkSchema } from "express-validator";

export const loginSchema = checkSchema({
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
  },
});

export const registerSchema = checkSchema({
  fullName: {
    notEmpty: {
      errorMessage: "Fullname is required",
    },
    trim: true,
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
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters",
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

  role: {
    optional: true,
    isIn: {
      options: [["customer", "admin"]],
      errorMessage: "Role must be either 'customer' or 'admin'",
    },
  },
});
