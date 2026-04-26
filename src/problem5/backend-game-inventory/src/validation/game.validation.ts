import { z } from "zod";

export const createGameSchema = {
  body: z.object({
    title: z.string(),
    genre: z.string(),
    platform: z.string(),
    quantity: z.number().int(),
    price: z.number(),
  }),
};

export const getAllGamesSchema = {
  query: z.object({
    title: z.string().optional(),
    genre: z.string().optional(),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    sortBy: z
      .enum(["createdAt", "price", "title"])
      .optional()
      .default("createdAt"),

    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
};
export const getGameByIdSchema = {
  params: z.object({
    id: z.string(),
  }),
};

export const updateGameSchema = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
    genre: z.string().optional(),
    platform: z.string().optional(),
    quantity: z.number().int().optional(),
    price: z.number().optional(),
  }),
};

export const deleteGameSchema = {
    params: z.object({
        id: z.string(),
    }),
};

export type CreateGameBody = z.infer<typeof createGameSchema.body>;
export type GetAllGamesQuery = z.infer<typeof getAllGamesSchema.query>;
export type GetGameByIdParams = z.infer<typeof getGameByIdSchema.params>;
export type UpdateGameBody = z.infer<typeof updateGameSchema.body>;
export type UpdateGameParams = z.infer<typeof updateGameSchema.params>;
export type DeleteGameParams = z.infer<typeof deleteGameSchema.params>;