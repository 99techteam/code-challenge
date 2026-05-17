import { body, param, query } from "express-validator";

const idParam = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid product id")
    .toInt(),
];

export const productValidator = {
  create: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be numeric")
      .toFloat(),
    body("description")
      .optional({ values: "null" })
      .isString()
      .withMessage("Description must be a string"),
  ],

  findAll: [
    query("page")
      .default(1)
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("limit")
      .default(10)
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
      .toInt(),
    query("name")
      .optional()
      .isString()
      .withMessage("Name must be a string")
      .customSanitizer((name) => ({
        name: { contains: name },
      })),
    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum price must be a positive number")
      .toFloat()
      .customSanitizer((minPrice) => ({
        price: { gte: minPrice },
      })),
    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Maximum price must be a positive number")
      .toFloat()
      .customSanitizer((maxPrice) => ({
        price: { lte: maxPrice },
      })),
  ],

  findById: idParam,

  update: [
    ...idParam,
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be numeric")
      .toFloat(),
    body("description")
      .optional({ values: "null" })
      .isString()
      .withMessage("Description must be a string"),
  ],

  delete: idParam,
};
