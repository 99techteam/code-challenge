import dotenv from "dotenv";

dotenv.config();

export const env = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/99problem5",
  PORT: process.env.PORT || 3000,
  X_API_KEY: process.env.X_API_KEY || "random-api-key",
};
