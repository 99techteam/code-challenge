import "reflect-metadata";
import fs from "node:fs";
import path from "node:path";
import { DataSource } from "typeorm";
import { ResourceEntity } from "../entities/ResourceEntity.js";

const databaseFileName =
    process.env.APP_ENV === "test"
        ? "./challengeDbTest.sqlite"
        : "./challengeDb.sqlite";

const resolvedDbPath = path.resolve(process.cwd(), databaseFileName);

fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

export const dataSource = new DataSource({
    type: "sqlite",
    database: resolvedDbPath,
    entities: [ResourceEntity],
    synchronize: true,
    logging: false,
});

export async function initializeDatabase(): Promise<DataSource> {
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
        await dataSource.query("PRAGMA foreign_keys = ON");
    }

    return dataSource;
}

export async function closeDatabase(): Promise<void> {
    if (dataSource.isInitialized) {
        await dataSource.destroy();
    }
}
