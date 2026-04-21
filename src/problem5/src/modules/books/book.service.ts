import { AppError } from "../../common/error-codes";
import { DEFAULT_BOOKS_PER_PAGE, DEFAULT_PAGE_NUMBER } from "./book.constant";
import { Book, BookDocument } from "./book.schema";

const _queryBuilder = (query: any) => {
  const filter: any = {};
  if (query.title) {
    filter.title = { $regex: ".*" + query.title + ".*", $options: "i" };
  }

  if (query.author) {
    filter.author = { $regex: ".*" + query.author + ".*", $options: "i" };
  }

  if (query.publisher) {
    filter.publisher = { $regex: ".*" + query.publisher + ".*", $options: "i" };
  }

  if (query.country) {
    filter.country = { $regex: ".*" + query.country + ".*", $options: "i" };
  }

  return filter;
};

const _checkExistedBook = async (
  title: string,
  author: string,
): Promise<void> => {
  const findExisting = await Book.findOne({
    title,
    author,
  }).exec();

  if (findExisting) {
    throw new AppError(
      "[createBook] Book with the same title and author already exists",
      400,
    );
  }
};

export const createBook = async (
  bookData: Partial<BookDocument>,
): Promise<BookDocument> => {
  try {
    await _checkExistedBook(
      bookData.title as string,
      bookData.author as string,
    );

    const book = new Book(bookData);
    return await book.save();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error("[createBook] Failed to create book: " + errorMessage);
  }
};

export const listBooks = async (
  query: any,
): Promise<{
  total: number;
  page: number;
  limit: number;
  data: BookDocument[];
}> => {
  try {
    const page = parseInt(query.page as string) || DEFAULT_PAGE_NUMBER;
    const limit = parseInt(query.limit as string) || DEFAULT_BOOKS_PER_PAGE;
    const skip = (page - 1) * limit;

    const _query = _queryBuilder(query);

    const [total, list] = await Promise.all([
      Book.countDocuments(_query),
      Book.find(_query).skip(skip).limit(limit).exec(),
    ]);

    return { total, page, limit, data: list };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new AppError(
      "[listBooks] Failed to list books: " + errorMessage,
      500,
    );
  }
};

export const getBookById = async (id: string): Promise<BookDocument> => {
  try {
    const book = await Book.findById(id).exec();
    if (!book) {
      throw new AppError("[getBookById] Book not found", 404);
    }

    return book;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    throw new AppError(
      "[getBookById] Failed to get book: " + errorMessage,
      500,
    );
  }
};

export const updateBook = async (
  id: string,
  updateData: Partial<BookDocument>,
): Promise<BookDocument> => {
  try {
    await _checkExistedBook(
      updateData.title as string,
      updateData.author as string,
    );

    const _updateData: Partial<BookDocument> = {
      title: updateData.title,
      author: updateData.author,
      publisher: updateData.publisher,
      publishedDate: updateData.publishedDate,
      country: updateData.country,
    };

    const updatedBook = await Book.findByIdAndUpdate(id, _updateData, {
      new: true,
    }).exec();

    if (!updatedBook) {
      throw new AppError("[updateBook] Book not found", 404);
    }

    return updatedBook;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    throw new AppError(
      "[updateBook] Failed to update book: " + errorMessage,
      500,
    );
  }
};

export const deleteBook = async (id: string): Promise<void> => {
  try {
    const deletedBook = await Book.findByIdAndDelete(id).exec();
    if (!deletedBook) {
      throw new AppError("[deleteBook] Book not found", 404);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    throw new AppError(
      "[deleteBook] Failed to delete book: " + errorMessage,
      500,
    );
  }
};
