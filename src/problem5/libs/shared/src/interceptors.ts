import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class SnakeToCamelInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertToSnakeCase(data)))
  }

  private convertToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.convertToSnakeCase(v))
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce(
        (result, key) => ({
          ...result,
          [this.camelToSnakeCase(key)]: this.convertToSnakeCase(obj[key]),
        }),
        {}
      )
    }
    return obj
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }
}
