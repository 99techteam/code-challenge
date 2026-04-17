import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Book } from "./types";

type DatabaseContent = {
  books: Book[];
};

const databasePath = path.join(process.cwd(), "data", "books.json");
const temporaryDatabasePath = path.join(process.cwd(), "data", "books.json.tmp");

const emptyDatabase: DatabaseContent = {
  books: [],
};

async function ensureDatabaseFileExists(): Promise<void> {
  await mkdir(path.dirname(databasePath), { recursive: true });

  try {
    await readFile(databasePath, "utf8");
  } catch {
    await writeDatabase(emptyDatabase);
  }
}

export async function readDatabase(): Promise<DatabaseContent> {
  await ensureDatabaseFileExists();

  const fileContent = await readFile(databasePath, "utf8");
  return JSON.parse(fileContent) as DatabaseContent;
}

export async function writeDatabase(content: DatabaseContent): Promise<void> {
  await mkdir(path.dirname(databasePath), { recursive: true });

  const json = JSON.stringify(content, null, 2);
  await writeFile(temporaryDatabasePath, json);
  await rename(temporaryDatabasePath, databasePath);
}
