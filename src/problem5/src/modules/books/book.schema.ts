import mongoose, { InferSchemaType } from "mongoose";

export const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    publishedDate: { type: Date, required: true },
    country: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const Book = mongoose.model("Book", BookSchema);

export type BookDocument = InferSchemaType<typeof BookSchema>;