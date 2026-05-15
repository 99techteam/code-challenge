import z from 'zod';

export const tokenSchema = z
  .object({
    payAmount: z
      .number({
        error: 'Invalid amount. Please enter a valid amount.',
      })
      .positive({
        message: 'Minimum amount must be greater than 0',
      }),
  })
  .required();

export type TokenSchemaType = z.infer<typeof tokenSchema>;
