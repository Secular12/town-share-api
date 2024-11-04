import vine from '@vinejs/vine'

export const hasAnyFrom = <SourceArray extends readonly unknown[], FromArray extends SourceArray>(
  sourceArray?: SourceArray,
  fromArray?: FromArray
) => {
  return fromArray?.some((fromItem) => sourceArray?.includes(fromItem))
}

export const hasOrIsAnyFrom = <
  Source extends unknown[] | unknown,
  From extends unknown[] | unknown,
>(
  source?: Source,
  from?: From
) => {
  if (source === undefined) return false

  return Array.isArray(from)
    ? from?.some((fromItem) => {
        return Array.isArray(source) ? source?.includes(fromItem) : fromItem === source
      })
    : Array.isArray(source)
      ? source?.includes(from)
      : from === source
}

export const orderBy = <T>(value: T | T[]) => {
  return vine.helpers.isArray(value) ? value : [value]
}
