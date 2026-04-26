import mongoose from "mongoose";
import { config } from "@/config";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error", error);
  }
};