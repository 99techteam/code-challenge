import mongoose from "mongoose";
import { ValidationFieldMessages } from "./book.constant";

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export const createBookValidator = (data: any): ValidationResult => {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      errors: [ValidationFieldMessages.INVALID_DATA],
    };
  }

  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push(ValidationFieldMessages.INVALID_TITLE);
  }

  if (!data.author || typeof data.author !== "string") {
    errors.push(ValidationFieldMessages.INVALID_AUTHOR);
  }

  if (!data.publisher || typeof data.publisher !== "string") {
    errors.push(ValidationFieldMessages.INVALID_PUBLISHER);
  }

  if (data.publishedDate && isNaN(Date.parse(data.publishedDate))) {
    errors.push(ValidationFieldMessages.INVALID_PUBLISHED_DATE);
  }

  if (!data.country || typeof data.country !== "string") {
    errors.push(ValidationFieldMessages.INVALID_COUNTRY);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const bookIdValidator = (id: any): ValidationResult & { id: string } => {
  if (
    !id ||
    typeof id !== "string" ||
    mongoose.Types.ObjectId.isValid(id) === false
  ) {
    return {
      id,
      valid: false,
      errors: ["Invalid book ID"],
    };
  }

  return {
    valid: true,
    id,
  };
};
