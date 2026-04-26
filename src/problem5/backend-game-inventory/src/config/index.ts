import { env } from "@/config/env";

export const config = {
  port: env.PORT,
  db: {
    uri: env.MONGO_URI,
  },
  isProd: env.NODE_ENV === "production",
};