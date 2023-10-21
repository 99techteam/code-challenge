import { model, Schema } from "mongoose";
import { MODELS_NAME } from "../constant";
import bcrypt from "bcrypt";
const UserSchema = new Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
      unique: true,
    },
    user_password: {
      type: String,
      required: true,
      select: false
    },
    user_point: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  this.user_password = await bcrypt.hash(this.user_password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.user_password);
};

export default model(MODELS_NAME.User, UserSchema);
