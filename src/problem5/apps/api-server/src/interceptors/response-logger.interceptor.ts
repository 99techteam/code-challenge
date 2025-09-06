import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'

import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseLoggerInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, query, params } = request

    // Log the request with body, query params, and route params if they exist
    this.logger.log({
      message: 'Incoming Request',
      method,
      url,
      traceId: request.traceId,
      ...(Object.keys(body || {}).length > 0 && {
        body: this.sanitizeData(body),
      }),
      ...(Object.keys(query || {}).length > 0 && {
        query: this.sanitizeData(query),
      }),
      ...(Object.keys(params || {}).length > 0 && {
        params: this.sanitizeData(params),
      }),
    })

    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: (response) => {
          const endTime = Date.now()
          const duration = endTime - startTime

          // Log successful response
          this.logger.log({
            message: 'Response sent successfully',
            method,
            url,
            traceId: request.traceId,
            statusCode: context.switchToHttp().getResponse().statusCode,
            duration: `${duration}ms`,
            ...(Object.keys(body || {}).length > 0 && {
              requestBody: this.sanitizeData(body),
            }),
            response: this.sanitizeData(response),
          })
        },
        error: (error) => {
          const endTime = Date.now()
          const duration = endTime - startTime

          // Log error response
          this.logger.error({
            message: 'Response error',
            method,
            url,
            traceId: request.traceId,
            statusCode: error.status || 500,
            duration: `${duration}ms`,
            ...(Object.keys(body || {}).length > 0 && {
              requestBody: this.sanitizeData(body),
            }),
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          })
        },
      })
    )
  }

  private sanitizeData(data: any): any {
    if (!data) return data

    // Deep clone the data to avoid modifying the original
    const clonedData = JSON.parse(JSON.stringify(data))

    // Add your sanitization logic here
    // For example, remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'api_key',
      'apikey',
      'key',
      'private_key',
      'privatekey',
    ]

    const sanitize = (obj: any) => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          if (sensitiveFields.includes(key.toLowerCase())) {
            obj[key] = '***REDACTED***'
          } else if (typeof obj[key] === 'object') {
            sanitize(obj[key])
          }
        })
      }
      return obj
    }

    return sanitize(clonedData)
  }
}
