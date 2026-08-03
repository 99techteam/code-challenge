import { Database } from "../database";
import { loadConfig } from "../config";

const config = loadConfig();
const database = new Database(config.databasePath);
database.close();

console.log(`Database is ready: ${config.databasePath}`);
