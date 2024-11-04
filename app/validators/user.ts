import * as ValidatorUtil from '#utils/validator'
import vine from '@vinejs/vine'

export const countAndIncludeOptions = [
  'locations',
  'organizationLocations',
  'organizations',
] as const

const counts = vine.group([
  vine.group.if((data) => vine.helpers.isArray(data.count), {
    count: vine.array(vine.enum(countAndIncludeOptions)).minLength(1),
  }),
  vine.group.else({
    count: vine.enum(['*', ...countAndIncludeOptions] as const).optional(),
  }),
])

const includes = vine.group([
  vine.group.if((data) => vine.helpers.isArray(data.include), {
    include: vine.array(vine.enum(countAndIncludeOptions)).minLength(1),
  }),
  vine.group.else({
    include: vine.enum(['*', ...countAndIncludeOptions] as const).optional(),
  }),
])

export const index = vine.compile(
  vine
    .object({
      isApplicationAdmin: vine.boolean().optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      search: vine.string().minLength(1).optional(),
    })
    .merge(
      ValidatorUtil.orderBy([
        'email',
        'firstName',
        'isApplicationAdmin',
        'lastName',
        'middleName',
        'nameSuffix',
        'createdAt',
        'updatedAt',
      ] as const)
    )
    .merge(counts)
    .merge(includes)
)

export const show = vine.compile(vine.object({}).merge(counts).merge(includes))

export const update = vine.compile(
  vine.object({
    firstName: vine.string().minLength(1).optional(),
    isApplicationAdmin: vine.boolean().optional(),
    lastName: vine.string().minLength(1).optional(),
    middleName: vine.string().minLength(1).nullable().optional(),
    nameSuffix: vine.string().minLength(1).nullable().optional(),
  })
)
