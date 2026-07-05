export interface ProductDTO {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly category: string;
  readonly sku: string;
  readonly isActive: boolean;
}

export interface ProductListDTO {
  readonly products: readonly ProductDTO[];
  readonly total: number;
}
