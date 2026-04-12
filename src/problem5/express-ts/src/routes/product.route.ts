import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/product.controller'

const router = Router()

// GET product by ID
router.get('/product/:id', getProductById)

// POST create new product
router.post('/product', createProduct)

// PUT update product
router.put('/product/:id', updateProduct)

// DELETE product
router.delete('/product/:id', deleteProduct)

// GET all products
router.get('/products', getProducts)

export default router
