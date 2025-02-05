import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const countGroup = <T extends readonly string[]>(countOptions: T) => {
  return vine.group([
    vine.group.if((data) => vine.helpers.isArray(data.count), {
      count: vine.array(vine.enum(countOptions)).minLength(1),
    }),
    vine.group.else({
      count: vine.enum(['*', ...countOptions] as const).optional(),
    }),
  ])
}

const includeGroup = <T extends readonly string[]>(includeOptions: T) => {
  return vine.group([
    vine.group.if((data) => vine.helpers.isArray(data.include), {
      include: vine.array(vine.enum(includeOptions)).minLength(1),
    }),
    vine.group.else({
      include: vine.enum(['*', ...includeOptions] as const).optional(),
    }),
  ])
}

const orderByGroup = <T extends readonly string[]>(columns: T) => {
  return vine.group([
    vine.group.if((data) => 'orderBy' in data && vine.helpers.isObject(data.orderBy), {
      orderBy: orderByObject(columns).optional(),
    }),
    vine.group.else({
      orderBy: vine.array(orderByObject(columns)).distinct('column').optional(),
    }),
  ])
}

const orderByObject = <T extends readonly string[]>(columns: T) => {
  return vine.object({
    column: vine.enum(columns),
    order: vine.enum(['asc', 'desc'] as const).optional(),
  })
}

const search = () => vine.string().trim().minLength(1).optional().requiredIfExists('searchBy')

const searchByGroup = <T extends readonly string[]>(searchByOptions: T) => {
  return vine.group([
    vine.group.if((data) => 'searchBy' in data && vine.helpers.isObject(data.searchBy), {
      searchBy: vine.array(vine.enum(searchByOptions)).minLength(1),
    }),
    vine.group.else({
      searchBy: vine.enum(searchByOptions).optional(),
    }),
  ])
}

const transformToLuxonDateTime = (date: Date | null) => {
  return date ? DateTime.fromJSDate(date).toUTC() : null
}

export default {
  countGroup,
  includeGroup,
  orderByGroup,
  orderByObject,
  search,
  searchByGroup,
  transformToLuxonDateTime,
}
