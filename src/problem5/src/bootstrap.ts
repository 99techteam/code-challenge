import { config } from "dotenv";
import { MongoClient } from "mongodb";
import { MongoRepository } from "./infra/repository/mongo";
import { SqliteRepository } from "./infra/repository/sqlite";
import { Repository } from "./domain/interface";
import * as Logger from "./utils/Logger";
import path from "path";

config();

const closeCallbacks: (() => Promise<void>)[] = [];

export const closePlatform = () => Promise.all(closeCallbacks.map((callback) => callback()));

export async function bootstrapPlatform(): Promise<void> {
  const APP_MODE = process.env.APP_MODE as string;
  const APP_KEY = process.env.APP_KEY as string;

  if (APP_KEY === undefined || APP_KEY == '') {
    Logger.instance.error("Undifined APP_KEY!");
    throw new Error("Undifined APP_KEY");
  }

  switch (APP_MODE) {
  case "local": {
    Logger.instance.info("Running in LOCAL mode (SQLite)");
    const dbPath = path.join(__dirname, './db/data.db');
    Logger.instance.info("Running in LOCAL mode (SQLite), Path: " + dbPath);
    const sqliteRepo = new SqliteRepository(dbPath);
    Repository.instance = sqliteRepo;

    // closeCallbacks.push(async () => sqliteRepo.close());
    break;
  }

  case "production":
  default: {
    Logger.instance.info("Running in PRODUCTION mode (MongoDB)");

    const MONGO_URL = process.env.MONGO_URL as string;
    const DB_NAME = process.env.MONGO_DBNAME || "99tech-curde-server";

    const client = await MongoClient.connect(MONGO_URL);
    Repository.instance = new MongoRepository(client, DB_NAME);

    closeCallbacks.push(async () => client.close());
    break;
  }
  }
}
