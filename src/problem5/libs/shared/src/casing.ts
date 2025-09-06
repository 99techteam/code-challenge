export function convertToCamelCase(obj: any): any {
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

export function convertToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertToSnakeCase(v))
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelToSnakeCase(key)]: convertToSnakeCase(obj[key]),
      }),
      {}
    )
  }
  return obj
}

export function snakeToCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
}

export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
