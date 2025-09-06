import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'

import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest()
        const traceId = request.traceId

        if (data && data.statusCode && data.statusCode >= 400) {
          return { ...data, traceId }
        }

        return { data, traceId }
      })
    )
  }
}
