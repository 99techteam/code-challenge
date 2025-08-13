import { CamelCasePlugin, PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";
import "dotenv/config";

const dialect = new PostgresDialect({
  pool: new Pool({
    host: process.env.POSTGRES_HOST,
    port: +(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  }),
});
export default defineConfig({
  dialect: dialect,
  migrations: {
    migrationFolder: "migrations",
  },
  plugins: [new CamelCasePlugin()],
});
