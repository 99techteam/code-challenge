import { z } from "zod"
import { Request, Response, NextFunction } from "express"
import { ValidationError, ValidatedRequest } from "../types"

// User registration validation
const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
})

// User login validation
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
})

// Math action validation
const actionSchema = z.object({
  action: z.enum(["plus", "minus"]),
  operand1: z.number()
    .int("Operand1 must be an integer")
    .min(-1000, "Operand1 must be at least -1000")
    .max(1000, "Operand1 cannot exceed 1000"),
  operand2: z.number()
    .int("Operand2 must be an integer")
    .min(-1000, "Operand2 must be at least -1000")
    .max(1000, "Operand2 cannot exceed 1000"),
})

// Validation middleware factory
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors: ValidationError[] = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      })
      return
    }

    ;(req as ValidatedRequest).validatedData = result.data
    next()
  }
}

// Math operation validator
const validateMathOperation = (
  action: string,
  operand1: number,
  operand2: number,
  result: number,
): boolean => {
  let expectedResult: number

  switch (action) {
    case "plus":
      expectedResult = operand1 + operand2
      break
    case "minus":
      expectedResult = operand1 - operand2
      break
    default:
      return false
  }

  return expectedResult === result
}

// Email format validator
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Username validator
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9]{3,50}$/
  return usernameRegex.test(username)
}

// Password strength validator
const isStrongPassword = (password: string): boolean => {
  // At least 6 characters, contains letter and number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
  return passwordRegex.test(password)
}

export {
  registerSchema,
  loginSchema,
  actionSchema,
  validate,
  validateMathOperation,
  isValidEmail,
  isValidUsername,
  isStrongPassword,
}
