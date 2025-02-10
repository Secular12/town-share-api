import vine from '@vinejs/vine'
import ValidatorUtil from '#utils/validator'

type IndexPayload = Awaited<ReturnType<(typeof index)['validate']>>

const countOptions = ['receivedAdminInvitations'] as const

const dateFilters = ValidatorUtil.dateFiltersSchema(['createdAt', 'updatedAt'] as const)

const includeOptions = [
  'receivedAdminInvitations',
  'receivedAdminInvitations.*',
  'receivedAdminInvitations.inviter',
] as const

const counts = ValidatorUtil.countSchema(countOptions)
const includes = ValidatorUtil.includeSchema(includeOptions)

const index = vine.compile(
  vine
    .object({
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      ...dateFilters.getProperties(),
    })
    .merge(counts)
    .merge(includes)
)

const show = vine.compile(vine.object({}).merge(counts).merge(includes))

export type { IndexPayload }

export default { countOptions, index, show }
