/**
 * Application configuration
 */

import dotenv from "dotenv";
import { DatabaseConfig, ServerConfig } from "../types";

// Load environment variables
dotenv.config();

export const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  apiVersion: process.env.API_VERSION || "v1",
};

export const databaseConfig: DatabaseConfig = {
  path: process.env.DB_PATH || "./database.sqlite",
};

export const isDevelopment = serverConfig.nodeEnv === "development";
export const isProduction = serverConfig.nodeEnv === "production";
