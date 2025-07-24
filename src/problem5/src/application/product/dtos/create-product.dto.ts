export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: string[];
  images: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
