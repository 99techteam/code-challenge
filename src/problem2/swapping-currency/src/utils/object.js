export const isArray = (obj) => {
  return Array.isArray(obj)
}

export const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null
}

export const isPrimitiveObject = (obj) => {
  return isObject(obj) && !isArray(obj)
}

export const isFunction = (obj) => {
  return typeof obj === 'function'
}

export const isPrimitive = (obj) => {
  return typeof obj !== 'object' && typeof obj !== 'function'
}

export const isEmpty = (obj) => {
  if (isNil(obj)) {
    return true
  }

  switch (typeof obj) {
    case 'undefined':
      return true
    case 'string':
      return !obj
    case 'number':
      return isNaN(obj)
    case 'object':
      return !(Object.keys(obj)?.length > 0)
    default:
      return false
  }
}

export const isNil = (obj) => {
  return obj === null || typeof obj === 'undefined'
}

