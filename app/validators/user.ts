import * as ValidatorUtil from '#utils/validator'
import vine from '@vinejs/vine'

export const countOptions = [
  'adminedNeighborhoods',
  'locations',
  'organizationLocations',
  'organizations',
] as const

export const includeOptions = [
  'adminedNeighborhoods',
  'locations',
  'locations.*',
  'locations.neighborhood',
  'organizationLocations',
  'organizationLocations.*',
  'organizationLocations.neighborhood',
  'organizations',
  'sponsor',
  'sponsoredUsers',
] as const

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
      isApplicationAdmin: vine.boolean().optional(),
      neighborhoodId: vine.number().min(1).optional(),
      organizationId: vine.number().min(1).optional(),
      organizationLocationId: vine.number().min(1).optional(),
      sponsorId: vine.number().min(1).optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
    })
    .merge(
      ValidatorUtil.orderByGroup([
        'id',
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
    .merge(
      ValidatorUtil.searchGroup([
        'email',
        'firstName',
        'fullName',
        'lastName',
        'middleName',
        'name',
        'nameSuffix',
      ] as const)
    )
)

export const show = vine.compile(vine.object({}).merge(counts).merge(includes))

export const update = vine.compile(
  vine.object({
    firstName: vine.string().optional(),
    isApplicationAdmin: vine.boolean().optional(),
    lastName: vine.string().optional(),
    middleName: vine.string().nullable().optional(),
    nameSuffix: vine.string().nullable().optional(),
  })
)
