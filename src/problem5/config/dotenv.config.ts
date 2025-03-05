import dotenv from "dotenv";

dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    DB_PATH: process.env.DB_PATH || "./db.sqlite",
};
