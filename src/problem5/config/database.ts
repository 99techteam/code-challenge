import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

export const db = knex({
    client: "sqlite3",
    connection: {
        filename: process.env.DB_PATH || "./db.sqlite",
    },
    useNullAsDefault: true,
});

// create table if not exist
db.schema.hasTable("items").then((exists) => {
    if (!exists) {
        return db.schema.createTable("items", (table) => {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.text("description");
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    }
});
