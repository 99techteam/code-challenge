import { Product } from '../model/product';
import { ProductDTO, ProductListDTO } from './product-dto';

export const toProductDTO = (product: Product): ProductDTO => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  sku: product.sku,
  isActive: product.isActive,
});

export const toProductListDTO = (products: readonly Product[], total: number): ProductListDTO => ({
  products: products.map(toProductDTO),
  total,
});
