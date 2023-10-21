import { model, Schema } from "mongoose";
import { MODELS_NAME } from "../constant";
const ProductSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_origin: {
      type: String,
      required: true,
    },
    product_color: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model(MODELS_NAME.product, ProductSchema);
