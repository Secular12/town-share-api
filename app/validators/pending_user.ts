import vine from '@vinejs/vine'
import ValidatorUtil from '#utils/validator'

type IndexPayload = Awaited<ReturnType<(typeof index)['validate']>>

const includeOptions = [
  'receivedAdminInvitations',
  'receivedAdminInvitations.*',
  'receivedAdminInvitations.inviter',
] as const

const includes = ValidatorUtil.includeGroup(includeOptions)

const index = vine.compile(
  vine
    .object({
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
    })
    .merge(includes)
)

const show = vine.compile(vine.object({}).merge(includes))

export type { IndexPayload }

export default { index, show }
