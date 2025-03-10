import { Request, Response, NextFunction } from 'express';
import Item from '../models/ItemModel';

const createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        const newItem = await Item.create({ name, description });
        res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
};

const getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
        const items = await Item.find(filter);
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

const getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) {
            const error = new Error('Item not found');
            (error as any).statusCode = 404;
            throw error;
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

const updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );
        if (!updatedItem) {
            const error = new Error('Item not found');
            (error as any).statusCode = 404;
            throw error;
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};

const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) {
            const error = new Error('Item not found');
            (error as any).statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem
};
