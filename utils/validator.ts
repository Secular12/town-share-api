import vine from '@vinejs/vine'

const orderByObject = <T extends readonly string[]>(columns: T) => {
  return vine.object({
    column: vine.enum(columns),
    order: vine.enum(['asc', 'desc'] as const).optional(),
  })
}

export const orderBy = <T extends readonly string[]>(columns: T) => {
  return vine.group([
    vine.group.if((data) => 'orderBy' in data && vine.helpers.isObject(data.orderBy), {
      orderBy: orderByObject(columns).optional(),
    }),
    vine.group.else({
      orderBy: vine.array(orderByObject(columns)).distinct('column').optional(),
    }),
  ])
}
