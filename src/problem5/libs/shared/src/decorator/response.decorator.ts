import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { createZodDto } from 'nestjs-zod'
import { z, ZodTypeAny } from 'zod'

const getName = (input: string) => {
  const words = input
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return `${words}ResponseDto`
}

const toResponseSchema = (summary: string, schema: ZodTypeAny) => {
  const className = getName(summary)
  const BaseDto = createZodDto(
    z.object({
      data: schema,
      traceId: z.string(),
    })
  )

  // Create a new class with dynamic name that extends the DTO
  return {
    [className]: class extends BaseDto {},
  }[className]
}

export function UseResponseSchema(summary: string, description: string, schema: ZodTypeAny) {
  const responseType = toResponseSchema(summary, schema)
  return applyDecorators(
    ApiOperation({ summary: summary }),
    ApiResponse({
      status: HttpStatus.OK,
      description: description,
      type: responseType,
    }),
    // TODO: Update to the authenticate decorator
    ApiHeader({
      name: 'apiToken',
      description: 'API Token',
      required: false,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal Server Error',
    })
  )
}
