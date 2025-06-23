import "reflect-metadata";
import { DataSource } from "typeorm";
import { Resource } from "../entities/resource"; // Import the entity directly
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",           
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,           
  logging: false,
  entities: [Resource],
  migrations: ["src/migrations/**/*.ts"],
});

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => console.log("❌ Database connection failed:", error));
