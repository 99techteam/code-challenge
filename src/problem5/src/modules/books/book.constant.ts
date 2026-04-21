export const ValidationFieldMessages = {
  INVALID_DATA: "Invalid request.body",
  INVALID_TITLE: "title is required and must be a string.",
  INVALID_AUTHOR: "author is required and must be a string.",
  INVALID_PUBLISHER: "publisher is required and must be a string.",
  INVALID_PUBLISHED_DATE:
    "publishedDate is required and must be a valid date string.",
  INVALID_COUNTRY: "country is required and must be a string.",
} as const;

export const DEFAULT_BOOKS_PER_PAGE = 10;
export const DEFAULT_PAGE_NUMBER = 1;
