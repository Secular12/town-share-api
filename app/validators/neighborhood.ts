import ValidatorUtil from '#utils/validator'
import vine from '@vinejs/vine'

const countOptions = ['admins', 'organizationLocations', 'userLocations'] as const
const includeOptions = [
  'admins',
  'admins.*',
  'admins.phoneNumbers',
  'admins.organizations',
] as const
const searchByOptions = ['city', 'country', 'name', 'state', 'zip'] as const

const counts = ValidatorUtil.countGroup(countOptions)
const includes = ValidatorUtil.includeGroup(includeOptions)

const index = vine.compile(
  vine
    .object({
      organizationId: vine.number().min(1).optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      search: ValidatorUtil.search(),
      userId: vine.number().min(1).optional(),
    })
    .merge(
      ValidatorUtil.orderByGroup([
        'id',
        'city',
        'country',
        'name',
        'state',
        'zip',
        'createdAt',
        'updatedAt',
      ] as const)
    )
    .merge(counts)
    .merge(includes)
    .merge(ValidatorUtil.searchByGroup(searchByOptions))
)

const show = vine.compile(vine.object({}).merge(counts).merge(includes))

const update = (id: number) =>
  vine.compile(
    vine.object({
      city: vine.string().optional(),
      country: vine.string().optional(),
      name: vine.string().unique({ column: 'name', id, table: 'neighborhoods' }).optional(),
      state: vine.string().optional(),
      zip: vine.string().nullable().optional(),
    })
  )

export default {
  countOptions,
  includeOptions,
  index,
  searchByOptions,
  show,
  update,
}
