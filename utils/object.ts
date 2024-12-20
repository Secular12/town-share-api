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

const hasAllKeys = (object: JsObject, key: Property[]) => {
  return key.every((k) => k in object)
}

const hasAnyKey = (object: JsObject, key: Property[]) => {
  return key.some((k) => k in object)
}

function mapEntries<T>(object: T, cb: (value: unknown, key: Property, index: number) => T) {
  return Object.entries(object as JsObject).reduce((acc, [key, value], index) => {
    const entry = cb(value, key, index)

    return {
      ...acc,
      ...entry,
    }
  }, {} as T)
}

function mapKeys<T>(object: T, cb: (value: unknown, key: Property, index: number) => Property) {
  return Object.entries(object as JsObject).reduce((acc, [key, value], index) => {
    const mappedKey = cb(value, key, index)

    return {
      ...acc,
      [mappedKey]: value,
    }
  }, {} as T)
}

function mapValues<T>(object: T, cb: (value: unknown, key: Property, index: number) => unknown) {
  return Object.entries(object as JsObject).reduce((acc, [key, value], index) => {
    const mappedValue = cb(value, key, index)

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

export default {
  every,
  filter,
  hasAllKeys,
  hasAnyKey,
  mapEntries,
  mapKeys,
  mapValues,
  some,
}
