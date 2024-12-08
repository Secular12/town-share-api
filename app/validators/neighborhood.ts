import * as ValidatorUtil from '#utils/validator'
import vine from '@vinejs/vine'

export const includeOptions = ['admins', 'admins.organizations'] as const
export const countOptions = ['admins', 'organizationLocations', 'userLocations'] as const

const counts = vine.group([
  vine.group.if((data) => vine.helpers.isArray(data.count), {
    count: vine.array(vine.enum(countOptions)).minLength(1),
  }),
  vine.group.else({
    count: vine.enum(['*', ...countOptions] as const).optional(),
  }),
])

const includes = vine.group([
  vine.group.if((data) => vine.helpers.isArray(data.include), {
    include: vine.array(vine.enum(includeOptions)).minLength(1),
  }),
  vine.group.else({
    include: vine.enum(['*', ...includeOptions] as const).optional(),
  }),
])

export const index = vine.compile(
  vine
    .object({
      organizationId: vine.number().min(1).optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      userId: vine.number().min(1).optional(),
    })
    .merge(ValidatorUtil.orderBy(['name', 'createdAt', 'updatedAt'] as const))
    .merge(counts)
    .merge(includes)
)

export const show = vine.compile(vine.object({}).merge(counts).merge(includes))
