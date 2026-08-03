import { randomUUID } from "node:crypto";
import { loadConfig } from "../config";
import { Database } from "../database";
import { TaskRepository } from "../repositories/task.repository";

const config = loadConfig();
const database = new Database(config.databasePath);
const repository = new TaskRepository(database);

const existing = repository.list({
  sortBy: "createdAt",
  order: "desc",
  limit: 1,
  offset: 0,
});

if (existing.total === 0) {
  repository.create(
    {
      title: "Review the CRUD API",
      description: "Try the filters, update the task, then delete it.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 86_400_000).toISOString(),
    },
    randomUUID(),
  );

  repository.create(
    {
      title: "Read README.md",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: null,
    },
    randomUUID(),
  );

  console.log("Seeded 2 tasks");
} else {
  console.log("Seed skipped because tasks already exist");
}

database.close();
