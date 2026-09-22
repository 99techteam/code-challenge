import { z } from 'zod';

/**
 * Largest amount the converter accepts. Above this, `toLocaleString` stops
 * being readable and the product stops being meaningful.
 */
export const MAX_AMOUNT = 1_000_000_000_000;

/**
 * One row of https://interview.switcheo.com/prices.json.
 *
 * The feed is third-party and not guaranteed well-formed — rows have shipped
 * without a `price` before — so every row is parsed individually and the bad
 * ones are dropped rather than failing the whole load.
 */
export const priceRecordSchema = z.object({
  currency: z.string().trim().min(1),
  date: z.iso.datetime(),
  price: z.number().finite().positive(),
});

export type PriceRecord = z.infer<typeof priceRecordSchema>;

/** The feed as a whole: a list of rows we validate one at a time. */
export const priceFeedSchema = z.array(z.unknown());

/**
 * The amount field. Validates the raw string rather than a parsed number so the
 * message can name the real problem ("Enter an amount" vs "greater than zero").
 */
export const amountSchema = z
  .string()
  .trim()
  .min(1, 'Enter an amount')
  .regex(/^\d*\.?\d*$/, 'Use digits and a single decimal point')
  .refine((value) => value !== '.' && Number.isFinite(Number(value)), 'Enter a valid number')
  .refine((value) => Number(value) > 0, 'Amount must be more than zero')
  .refine((value) => Number(value) <= MAX_AMOUNT, 'Amount is too large to convert');

/**
 * A complete, convertible request: a valid amount between two distinct assets.
 * It is also the shape of the converter's form, which validates against it
 * through react-hook-form's zod resolver.
 */
export const swapRequestSchema = z
  .object({
    fromCode: z.string().min(1, 'Pick an asset to convert from'),
    toCode: z.string().min(1, 'Pick an asset to convert to'),
    /** The side `amount` was typed into, and so is denominated in. */
    source: z.enum(['from', 'to']),
    amount: amountSchema,
  })
  .refine((value) => value.fromCode !== value.toCode, {
    message: 'Pick two different assets',
    path: ['toCode'],
  });

export type SwapRequest = z.infer<typeof swapRequestSchema>;
