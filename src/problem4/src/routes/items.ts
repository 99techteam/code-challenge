import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItemById,
  listItems,
  updateItem,
} from "../repositories/itemsRepository.js";
import { toPublicItem } from "../types/item.js";

export const itemsRouter = Router();

itemsRouter.post("/", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const description = typeof body.description === "string" ? body.description : "";
  const category = typeof body.category === "string" ? body.category : undefined;
  const row = createItem({ name, description, category });
  res.status(201).json(toPublicItem(row));
});

itemsRouter.get("/", (req, res) => {
  const q = req.query;
  const category = typeof q.category === "string" ? q.category : undefined;
  const search = typeof q.search === "string" ? q.search : undefined;
  const limit = typeof q.limit === "string" ? Number.parseInt(q.limit, 10) : undefined;
  const offset = typeof q.offset === "string" ? Number.parseInt(q.offset, 10) : undefined;

  if (limit !== undefined && Number.isNaN(limit)) {
    res.status(400).json({ error: "limit must be a number" });
    return;
  }
  if (offset !== undefined && Number.isNaN(offset)) {
    res.status(400).json({ error: "offset must be a number" });
    return;
  }

  const rows = listItems({ category, search, limit, offset });
  res.json(rows.map(toPublicItem));
});

itemsRouter.get("/:id", (req, res) => {
  const row = getItemById(req.params.id);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toPublicItem(row));
});

itemsRouter.patch("/:id", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const patch: { name?: string; description?: string; category?: string } = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      res.status(400).json({ error: "name must be a non-empty string" });
      return;
    }
    patch.name = body.name;
  }
  if (body.description !== undefined) {
    patch.description = typeof body.description === "string" ? body.description : "";
  }
  if (body.category !== undefined) {
    if (typeof body.category !== "string") {
      res.status(400).json({ error: "category must be a string" });
      return;
    }
    patch.category = body.category;
  }
  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "No updatable fields provided" });
    return;
  }
  const row = updateItem(req.params.id, patch);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toPublicItem(row));
});

itemsRouter.delete("/:id", (req, res) => {
  const removed = deleteItem(req.params.id);
  if (!removed) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});
