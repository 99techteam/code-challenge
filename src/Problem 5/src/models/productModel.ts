import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  stock_quantity: number;
  price: number;
  discount: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, unique: true },
    stock_quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
