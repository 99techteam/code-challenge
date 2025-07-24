export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  tags?: string[];
  images?: string[];
  isActive?: boolean;
  updatedAt?: Date;
}
