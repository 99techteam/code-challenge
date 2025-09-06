import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'

import { Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import { ZodError } from 'zod'

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const zodError = exception.getZodError() as ZodError
    const firstError = zodError.issues[0]

    const fieldName = firstError.path[firstError.path.length - 1].toString()

    return response.status(400).json({
      statusCode: 400,
      message: `${fieldName} ${firstError.message}`,
      error: 'Bad Request',
    })
  }
}
