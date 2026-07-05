export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly category: string;
  readonly sku: string;
  readonly isActive: boolean;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  sku: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilter {
  readonly category?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly search?: string;
  readonly page: number;
  readonly limit: number;
}

export interface ProductRow {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly category: string;
  readonly sku: string;
  readonly is_active: boolean;
  readonly metadata: Record<string, unknown>;
  readonly deleted_at: Date | null;
  readonly created_at: Date;
  readonly updated_at: Date;
}
