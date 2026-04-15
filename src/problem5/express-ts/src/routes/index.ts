import { Router } from 'express'
import productRoutes from './product.route'

const router = Router()

router.use('/api', productRoutes)

export default router
