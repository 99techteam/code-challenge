import dotenv from "dotenv";

dotenv.config();

const defaultPort = 3000;

export const env = {
  authToken: process.env.AUTH_TOKEN ?? "change-me",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/code_challenge_problem5",
  port: Number(process.env.PORT ?? defaultPort)
};
