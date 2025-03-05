import { Request, Response } from "express";
import { db } from "./config/database";
import { Item } from "./models/item.model";

// Create new resource
export const createItem = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const [id] = await db("items").insert({ name, description });
        const newItem = await db("items").where({ id }).first();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get list of resources with filter
export const listItems = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        let query = db("items");

        if (search) {
            query = query.where("name", "like", `%${search}%`);
        }

        const items = await query.select();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// get details of a resource
export const getItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await db("items").where({ id }).first();

        if (!item) return res.status(404).json({ error: "Item not found" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update resource
export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updated = await db("items").where({ id }).update({ name, description });

        if (!updated) return res.status(404).json({ error: "Item not found" });

        const updatedItem = await db("items").where({ id }).first();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete resource
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await db("items").where({ id }).del();

        if (!deleted) return res.status(404).json({ error: "Item not found" });

        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
