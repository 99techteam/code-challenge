"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBookQuerySchema = exports.updateBookSchema = exports.createBookSchema = exports.bookStatusSchema = void 0;
const zod_1 = require("zod");
exports.bookStatusSchema = zod_1.z.enum(["available", "borrowed", "archived"]);
exports.createBookSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "title is required"),
    author: zod_1.z.string().trim().min(1, "author is required"),
    status: exports.bookStatusSchema.default("available"),
    publishedYear: zod_1.z.number().int().min(0).max(9999).optional(),
});
exports.updateBookSchema = exports.createBookSchema.partial().refine((value) => Object.keys(value).length > 0, "at least one field is required");
exports.listBookQuerySchema = zod_1.z.object({
    status: exports.bookStatusSchema.optional(),
    author: zod_1.z.string().trim().optional(),
    q: zod_1.z.string().trim().optional(),
});
