import { JsObject, Property } from '#types/object'

const filter = (
  object: JsObject,
  cb: (value: unknown, key: Property, index: number) => boolean
) => {
  return Object.entries(object).reduce((acc, [key, value], index) => {
    const isKeep = cb(value, key, index)

    if (!isKeep) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {} as JsObject)
}

const forEach = (object: JsObject, cb: (value: unknown, key: Property, index: number) => void) => {
  Object.entries(object).forEach(([key, value], index) => {
    cb(value, key, index)
  })
}

const hasAllKeys = (object: JsObject, key: Property[]) => {
  return key.every((k) => k in object)
}

const hasAnyKey = (object: JsObject, key: Property[]) => {
  return key.some((k) => k in object)
}

const isEmpty = (object?: JsObject | null) => {
  return !object || !Object.keys(object).length
}

const mapEntries = <T>(object: T, cb: (value: unknown, key: Property, index: number) => T) => {
  return Object.entries(object as JsObject).reduce((acc, [key, value], index) => {
    const entry = cb(value, key, index)

    return {
      ...acc,
      ...entry,
    }
  }, {} as T)
}

const mapKeys = <T extends Record<keyof T, T[keyof T]>, K extends Property>(
  obj: T,
  cb: (value: T[keyof T], key: keyof T, index: number) => K
) => {
  return Object.entries(obj).reduce((acc, [key, value], index) => {
    const mappedKey = cb(value as T[keyof T], key as keyof T, index)

    return {
      ...acc,
      [mappedKey]: value,
    }
  }, {} as T)
}

const mapValues = <T extends Record<keyof T, T[keyof T]>, V>(
  obj: T,
  cb: (value: T[keyof T], key: keyof T, index: number) => V
): Record<keyof T, V> => {
  return Object.entries(obj).reduce((acc, [key, value], index) => {
    const mappedValue = cb(value as T[keyof T], key as keyof T, index)

    return {
      ...acc,
      [key]: mappedValue,
    }
  }, {} as T)
}

const every = (object: JsObject, cb: (value: unknown, key: Property, index: number) => boolean) => {
  return Object.entries(object).every(([key, value], index) => cb(value, key, index))
}

const some = (object: JsObject, cb: (value: unknown, key: Property, index: number) => boolean) => {
  return Object.entries(object).some(([key, value], index) => cb(value, key, index))
}

const toArray = <T extends Record<keyof T, T[keyof T]>, V>(
  obj: T,
  cb?: (value: T[keyof T], key: keyof T, index: number) => V
) => {
  return Object.entries(obj).reduce((acc, [key, value], index) => {
    const mappedValue = cb ? cb(value as T[keyof T], key as keyof T, index) : (value as T[keyof T])

    acc.push(mappedValue)

    return acc
  }, [] as V[])
}

export default {
  every,
  filter,
  forEach,
  hasAllKeys,
  hasAnyKey,
  isEmpty,
  mapEntries,
  mapKeys,
  mapValues,
  some,
  toArray,
}
