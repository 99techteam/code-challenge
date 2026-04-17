export type CreateResourceInput = {
  code: string;
  name: string;
  description?: string;
  quantity?: number;
};

export type UpdateResourceInput = {
  code?: string;
  name?: string;
  description?: string | null;
  quantity?: number;
};

export type IncrementResourceInput = {
  amount: number;
  simulateDelayMs?: number;
};
