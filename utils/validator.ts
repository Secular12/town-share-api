import vine from '@vinejs/vine'

const orderByObject = <T extends readonly string[]>(columns: T) => {
  return vine.object({
    column: vine.enum(columns),
    order: vine.enum(['asc', 'desc'] as const).optional(),
  })
}

const searchObject = <T extends readonly string[]>(columns: T) => {
  return vine.object({
    column: vine.enum(columns),
    value: vine.string().trim().minLength(1),
  })
}

export const orderByGroup = <T extends readonly string[]>(columns: T) => {
  return vine.group([
    vine.group.if((data) => 'orderBy' in data && vine.helpers.isObject(data.orderBy), {
      orderBy: orderByObject(columns).optional(),
    }),
    vine.group.else({
      orderBy: vine.array(orderByObject(columns)).distinct('column').optional(),
    }),
  ])
}

export const searchGroup = <T extends readonly string[]>(columns: T) => {
  return vine.group([
    vine.group.if((data) => 'search' in data && vine.helpers.isObject(data.search), {
      search: searchObject(columns).optional(),
    }),
    vine.group.else({
      search: vine.array(searchObject(columns)).distinct('column').optional(),
    }),
  ])
}
