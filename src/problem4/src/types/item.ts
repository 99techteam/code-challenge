export interface ItemRow {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ItemPublic {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const toPublicItem = (row: ItemRow): ItemPublic => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
