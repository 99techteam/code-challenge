import { promises as fs } from "fs";
import path from "path";
import { DatabaseSchema } from "./types";

const defaultDatabase: DatabaseSchema = {
  books: [],
};

export class JsonDatabase {
  constructor(private readonly filePath: string) {}

  async read(): Promise<DatabaseSchema> {
    await this.ensureFile();

    const content = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(content) as DatabaseSchema;
  }

  async write(data: DatabaseSchema): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await this.write(defaultDatabase);
    }
  }
}

const databasePath = process.env.DATABASE_FILE
  ? path.resolve(process.env.DATABASE_FILE)
  : path.resolve(__dirname, "../data/database.json");

export const database = new JsonDatabase(databasePath);

