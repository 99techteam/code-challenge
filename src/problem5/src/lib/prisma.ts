import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../../generated/prisma/client.js";
import { config } from "../config/config.js";


const connectionString = `${config.DATABASE_URL}`;

console.log("Connection String", connectionString);

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };