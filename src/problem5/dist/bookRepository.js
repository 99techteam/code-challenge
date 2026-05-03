"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBooks = listBooks;
exports.getBookById = getBookById;
exports.createBook = createBook;
exports.updateBook = updateBook;
exports.deleteBook = deleteBook;
const crypto_1 = require("crypto");
const database_1 = require("./database");
async function listBooks(filters) {
    const data = await database_1.database.read();
    const author = filters.author?.toLowerCase();
    const query = filters.q?.toLowerCase();
    return data.books.filter((book) => {
        if (filters.status && book.status !== filters.status) {
            return false;
        }
        if (author && !book.author.toLowerCase().includes(author)) {
            return false;
        }
        if (query) {
            const searchable = `${book.title} ${book.author}`.toLowerCase();
            if (!searchable.includes(query)) {
                return false;
            }
        }
        return true;
    });
}
async function getBookById(id) {
    const data = await database_1.database.read();
    return data.books.find((book) => book.id === id) ?? null;
}
async function createBook(input) {
    const data = await database_1.database.read();
    const now = new Date().toISOString();
    const book = {
        id: (0, crypto_1.randomUUID)(),
        ...input,
        createdAt: now,
        updatedAt: now,
    };
    data.books.push(book);
    await database_1.database.write(data);
    return book;
}
async function updateBook(id, input) {
    const data = await database_1.database.read();
    const index = data.books.findIndex((book) => book.id === id);
    if (index === -1) {
        return null;
    }
    const updatedBook = {
        ...data.books[index],
        ...input,
        updatedAt: new Date().toISOString(),
    };
    data.books[index] = updatedBook;
    await database_1.database.write(data);
    return updatedBook;
}
async function deleteBook(id) {
    const data = await database_1.database.read();
    const nextBooks = data.books.filter((book) => book.id !== id);
    if (nextBooks.length === data.books.length) {
        return false;
    }
    data.books = nextBooks;
    await database_1.database.write(data);
    return true;
}
