import { checkSchema } from "express-validator";

export const loginSchema = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Email is not valid",
    },
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
  },

  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Email is not valid",
    },
  },

  password: {
    notEmpty: {
      errorMessage: "Password is required",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters",
    },
  },
});
