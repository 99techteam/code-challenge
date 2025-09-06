import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * Base pagination schema with configurable default values
 *
 * @param defaultLimit - Default number of items per page (default: 20)
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Zod schema for pagination
 */
export const createPaginationSchema = (defaultLimit = 20, maxLimit = 100) => {
  return z.object({
    page: z.coerce.number().int().positive().min(1, { message: 'Page number must be at least 1' }).default(1),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .min(1, { message: 'Limit must be at least 1' })
      .max(maxLimit)
      .default(defaultLimit),
    total: z.number().int().nonnegative().optional(),
  })
}

// Standard pagination schema with default values
export const pagingDTOSchema = createPaginationSchema()

export class PagingDTO extends createZodDto(pagingDTOSchema) {}

// Type for pagination request
export type PaginationRequest = z.infer<typeof pagingDTOSchema>

// Backward compatibility alias
export class PaginationDTO extends PagingDTO {}

// Response pagination schema
export const PaginationResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
})

// Type for pagination response
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>

export type Paginated<E> = {
  data: E[]
  paging: PaginationResponse
}

/**
 * Creates a standardized pagination response
 *
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Number of items per page
 * @returns Pagination response object
 */
export const createPaginationResponse = (total: number, page: number, limit: number): PaginationResponse => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  }
}
