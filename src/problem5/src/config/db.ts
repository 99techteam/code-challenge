import { Pool } from 'pg';
import dotenv from "dotenv";
dotenv.config();

const client = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: ' process.env.DATABASE_PASSWORD as unknown as string',
  port: process.env.DATABASE_PORT as unknown as number
});

client.connect()
  .then(() => console.log("Database connected successfully!"))
  .catch(err => console.error("Database connection error:", err));

export default client;
