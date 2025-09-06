import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import * as qs from 'qs'

function convertToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertToCamelCase(v))
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeToCamelCase(key)]: convertToCamelCase(obj[key]),
      }),
      {}
    )
  }
  return obj
}

function snakeToCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
}

export const TransformedQuery = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const url = request.url.split('?')[1] || ''

  // Use qs to parse the query string with proper array handling
  const parsedQuery = qs.parse(url, {
    arrayLimit: 100,
    parseArrays: true,
  })

  return convertToCamelCase(parsedQuery)
})

export const TransformedBody = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return convertToCamelCase({ ...request.body })
})
