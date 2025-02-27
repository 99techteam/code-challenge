import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/product.model';

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create product', error });
    }
};

// Get all products with basic filtering
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        // Handle query parameters for filtering
        const { category, inStock, minPrice, maxPrice } = req.query;

        let whereClause: any = {};

        if (category) {
            whereClause.category = category;
        }

        if (inStock !== undefined) {
            whereClause.inStock = inStock === 'true';
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                whereClause.price[Op.gte] = Number(minPrice);
            }
            if (maxPrice) {
                whereClause.price[Op.lte] = Number(maxPrice);
            }
        }

        const products = await Product.findAll({ where: whereClause });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error });
    }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product', error });
    }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const [updated] = await Product.update(req.body, {
            where: { id: req.params.id }
        });

        if (updated === 0) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        const updatedProduct = await Product.findByPk(req.params.id);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update product', error });
    }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });

        if (deleted === 0) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error });
    }
};