import { model, Schema } from "mongoose";
import { MODELS_NAME } from "../constant";
const UserSchema = new Schema(
  {
    User_name: {
      type: String,
      required: true,
    },
    User_price: {
      type: Number,
      required: true,
    },
    User_origin: {
      type: String,
      required: true,
    },
    User_color: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model(MODELS_NAME.User, UserSchema);
