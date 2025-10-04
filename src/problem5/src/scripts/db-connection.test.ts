const knexConfig = require("../../knexfile");
import knex from "knex";

const db = knex(knexConfig);

export async function testDbConnection() {
  try {
    await db.raw("SELECT 1+1 AS result");
    console.log("✅ Database connection successful");
  } catch (error: any) {
    console.error("❌ Database connection failed:", error);
    await db.destroy();
  }
}
