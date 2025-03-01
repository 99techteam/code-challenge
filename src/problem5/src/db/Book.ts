import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: String,
  price: Number,
});
export const BookModel = mongoose.model("Book", BookSchema);
