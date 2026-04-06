import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { TaskOrmEntity } from "./entities/task.orm-entity";

const isTest = process.env.NODE_ENV === "test";

let dbLocation: string;
if (isTest) {
  dbLocation = ":memory:";
} else {
  const dbPath = process.env.DB_PATH ?? "./data/tasks.sqlite";
  const resolved = path.resolve(dbPath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  dbLocation = resolved;
}

export const AppDataSource = new DataSource({
  type: "sqljs",
  location: dbLocation,
  autoSave: !isTest,
  entities: [TaskOrmEntity],
  synchronize: true,
  logging: false,
});
