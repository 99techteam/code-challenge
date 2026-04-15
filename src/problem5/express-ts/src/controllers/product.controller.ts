import { Request, Response } from 'express'
import Product from '../models/products.model'

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description } = req.body as {
      name: string
      price: number
      description?: string
    }

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' })
    }

    const product = new Product({ name, price, description })
    await product.save()
    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully'
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      price
    } = req.query as {
      page?: string
      limit?: string
      name?: string
      price?: string
    }
    const products = await Product.find({
      ...(name && { name: { $regex: name, $options: 'i' } }),
      ...(price && { price: Number(price) })
    })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    return res.status(200).json({
      status: 'success',
      data: products
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    return res.status(200).json({
      status: 'success',
      data: product
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, price, description } = req.body
    const product = await Product.findByIdAndUpdate(
      id,
      { name, price, description },
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: product
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}
