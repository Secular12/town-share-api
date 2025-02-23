import vine from '@vinejs/vine'
import { SchemaTypes } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

const countSchema = <T extends readonly string[]>(countOptions: T) => {
  return vine.group([
    vine.group.if((data) => vine.helpers.isArray(data.count), {
      count: vine.array(vine.enum(countOptions)).minLength(1),
    }),
    vine.group.else({
      count: vine.enum(countOptions).optional(),
    }),
  ])
}

const dateFiltersSchema = <T extends string>(columns: T[]) => {
  const columnDatesObject = columns.reduce(
    (acc: Record<T, SchemaTypes>, column: T) => {
      acc[column] = vine.date().optional().transform(luxonDateTimeTransform)
      return acc
    },
    {} as Record<T, SchemaTypes>
  )

  return vine.object({
    afterE: vine.object(columnDatesObject).optional(),
    afterI: vine.object(columnDatesObject).optional(),
    beforeE: vine.object(columnDatesObject).optional(),
    beforeI: vine.object(columnDatesObject).optional(),
  })
}

const getIncludeOptions = <const T extends readonly string[]>(preloadOptions: T) => {
  return preloadOptions.reduce((options: string[], preloadOption) => {
    const preloadSplit = preloadOption.split('.')

    const wildCards = preloadSplit.reduce((wildCardAcc: string[], _, preloadSplitIndex) => {
      const wildCard =
        preloadSplitIndex === 0 ? '*' : `${preloadSplit.slice(0, preloadSplitIndex).join('.')}.*`

      if (!options.includes(wildCard)) wildCardAcc.push(wildCard)

      return wildCardAcc
    }, [])

    return [...options, ...wildCards, preloadOption]
  }, [])
}

const includeSchema = <T extends readonly string[]>(includeOptions: T) => {
  return vine.group([
    vine.group.if((data) => vine.helpers.isArray(data.include), {
      include: vine.array(vine.enum(includeOptions)).minLength(1),
    }),
    vine.group.else({
      include: vine.enum(includeOptions).optional(),
    }),
  ])
}

const luxonDateTimeTransform = (date: Date | null) => {
  return date ? DateTime.fromJSDate(date).toUTC() : null
}

const orderBySchema = <T extends readonly string[]>(columns: T) => {
  return vine.object({
    column: vine.enum(columns),
    order: vine.enum(['asc', 'desc'] as const).optional(),
  })
}

const searchSchema = () => vine.string().trim().minLength(1).optional().requiredIfExists('searchBy')

const searchBySchema = <T extends readonly string[]>(searchByOptions: T) => {
  return vine.group([
    vine.group.if((data) => 'searchBy' in data && vine.helpers.isObject(data.searchBy), {
      searchBy: vine.array(vine.enum(searchByOptions)).minLength(1),
    }),
    vine.group.else({
      searchBy: vine.enum(searchByOptions).optional(),
    }),
  ])
}

const singleOrMultipleOrderBySchema = <T extends readonly string[]>(columns: T) => {
  return vine.group([
    vine.group.if((data) => 'orderBy' in data && vine.helpers.isObject(data.orderBy), {
      orderBy: orderBySchema(columns).optional(),
    }),
    vine.group.else({
      orderBy: vine.array(orderBySchema(columns)).distinct('column').optional(),
    }),
  ])
}

export default {
  countSchema,
  dateFiltersSchema,
  getIncludeOptions,
  includeSchema,
  luxonDateTimeTransform,
  orderBySchema,
  searchSchema,
  searchBySchema,
  singleOrMultipleOrderBySchema,
}
