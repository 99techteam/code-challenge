"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const zod_1 = require("zod");
const bookRepository_1 = require("./bookRepository");
const validation_1 = require("./validation");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
exports.app.post("/books", async (req, res, next) => {
    try {
        const input = validation_1.createBookSchema.parse(req.body);
        const book = await (0, bookRepository_1.createBook)(input);
        res.status(201).json({ data: book });
    }
    catch (error) {
        next(error);
    }
});
exports.app.get("/books", async (req, res, next) => {
    try {
        const filters = validation_1.listBookQuerySchema.parse(req.query);
        const books = await (0, bookRepository_1.listBooks)(filters);
        res.json({ data: books, count: books.length });
    }
    catch (error) {
        next(error);
    }
});
exports.app.get("/books/:id", async (req, res, next) => {
    try {
        const book = await (0, bookRepository_1.getBookById)(req.params.id);
        if (!book) {
            res.status(404).json({ error: "Book not found" });
            return;
        }
        res.json({ data: book });
    }
    catch (error) {
        next(error);
    }
});
exports.app.patch("/books/:id", async (req, res, next) => {
    try {
        const input = validation_1.updateBookSchema.parse(req.body);
        const book = await (0, bookRepository_1.updateBook)(req.params.id, input);
        if (!book) {
            res.status(404).json({ error: "Book not found" });
            return;
        }
        res.json({ data: book });
    }
    catch (error) {
        next(error);
    }
});
exports.app.delete("/books/:id", async (req, res, next) => {
    try {
        const deleted = await (0, bookRepository_1.deleteBook)(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Book not found" });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
exports.app.use((error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "Validation failed",
            details: error.flatten(),
        });
        return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
});
