import dotenv from "dotenv";
import path from "path";

// Load the appropriate .env file based on NODE_ENV
const envFilePath = path.resolve(
  __dirname,
  `../../.env.${process.env.NODE_ENV || "development"}`
);
dotenv.config({ path: envFilePath });

interface AppConfig {
  // Environment
  nodeEnv: string;

  // Server
  port: number;
  host: string;

  // Jet-Logger
  jetLoggerMode: string;
  jetLoggerFilepath: string;
  jetLoggerTimestamp: boolean;
  jetLoggerFormat: string;

  // Database (PostgreSQL)
  dbMasterHost: string;
  dbSlaveHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbPort: number;

  // CORS
  corsOriginPorts: number[];
  corsOriginString: string; // A string representation for CORS library usage if needed
}

const config: AppConfig = {
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",

  // Server
  port: parseInt(process.env.PORT || "4000", 10),
  host: process.env.HOST || "localhost",

  // Jet-Logger
  jetLoggerMode: process.env.JET_LOGGER_MODE || "CONSOLE",
  jetLoggerFilepath: process.env.JET_LOGGER_FILEPATH || "jet-logger.log",
  jetLoggerTimestamp: process.env.JET_LOGGER_TIMESTAMP === "TRUE", // Convert string to boolean
  jetLoggerFormat: process.env.JET_LOGGER_FORMAT || "LINE",

  // Database (PostgreSQL)
  dbMasterHost: process.env.DB_MASTER_HOST || "localhost",
  dbSlaveHost: process.env.DB_SLAVE_HOST || "localhost",
  dbUser: process.env.DB_USER || "admin",
  dbPassword: process.env.DB_PASSWORD || "admin",
  dbName: process.env.DB_NAME || "crude",
  dbPort: parseInt(process.env.DB_PORT || "15432", 10),

  // CORS
  corsOriginPorts: (process.env.CORS_ORIGIN_PORT || "4000,14000")
    .split(",")
    .map((portStr) => parseInt(portStr.trim(), 10))
    .filter((port) => !isNaN(port)), // Ensure only valid numbers are kept
  corsOriginString: process.env.CORS_ORIGIN_PORT || "4000,14000", // Keep original string for CORS library if it needs it
};

export default config;
