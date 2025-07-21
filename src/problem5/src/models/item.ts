export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date | null;
}
export interface CreateItemDTO {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface UpdateItemDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
}
