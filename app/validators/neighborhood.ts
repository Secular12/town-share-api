import ValidatorUtil from '#utils/validator'
import vine from '@vinejs/vine'

const countOptions = [
  '*',
  'users',
  // 'organizationLocations',
  'userLocations',
] as const

const dateFilters = ValidatorUtil.dateFiltersSchema(['createdAt', 'updatedAt'] as const)

const preloadOptions = ['admins'] as const

const includeOptions = ValidatorUtil.getIncludeOptions(preloadOptions)

const searchByOptions = ['city', 'country', 'name', 'state', 'zip'] as const

const counts = ValidatorUtil.countSchema(countOptions)

const includes = ValidatorUtil.includeSchema(includeOptions)

const index = vine.compile(
  vine
    .object({
      // organizationId: vine.number().min(1).optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      search: ValidatorUtil.searchSchema(),
      userId: vine.number().min(1).optional(),
      ...dateFilters.getProperties(),
    })
    .merge(
      ValidatorUtil.singleOrMultipleOrderBySchema([
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
    .merge(ValidatorUtil.searchBySchema(searchByOptions))
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
  preloadOptions,
  searchByOptions,
  show,
  update,
}
