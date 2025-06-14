import { z } from 'zod';

const TokenPriceSchema = z.object({
  currency: z.string(),
  date: z.string().datetime(),
  price: z.number(),
});

export const TokenPricesSchema = z.array(TokenPriceSchema);

export type TokenPrice = z.infer<typeof TokenPriceSchema>;
export type TokenPrices = z.infer<typeof TokenPricesSchema>;
export type TokenPriceMap = Record<string, number>;