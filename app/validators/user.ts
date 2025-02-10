import ValidatorUtil from '#utils/validator'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

type IndexPayload = Awaited<ReturnType<(typeof index)['validate']>>
type UpdatePayload = Awaited<ReturnType<(typeof update)['validate']>>

const countOptions = [
  'adminedNeighborhoods',
  'locations',
  'organizationLocations',
  'organizations',
  'phoneNumbers',
  'receivedAdminInvitations',
  'sentAdminInvitations',
] as const

const includeOptions = [
  'adminedNeighborhoods',
  'locations',
  'locations.*',
  'locations.neighborhood',
  'organizationLocations',
  'organizationLocations.*',
  'organizationLocations.neighborhood',
  'organizations',
  'phoneNumbers',
  'receivedAdminInvitations',
  'receivedAdminInvitations.*',
  'receivedAdminInvitations.inviter',
  'sentAdminInvitations',
  'sentAdminInvitations.*',
  'sentAdminInvitations.pendingUser',
  'sentAdminInvitations.user',
  'sponsor',
  'sponsoredUsers',
] as const

const searchByOptions = [
  'email',
  'firstName',
  'fullName',
  'lastName',
  'middleName',
  'name',
  'nameSuffix',
] as const

const counts = ValidatorUtil.countSchema(countOptions)

const dateFilters = ValidatorUtil.dateFiltersSchema([
  'createdAt',
  'deactivatedAt',
  'updatedAt',
] as const)

const includes = ValidatorUtil.includeSchema(includeOptions)

const index = vine.compile(
  vine
    .object({
      isActive: vine.boolean().optional(),
      isApplicationAdmin: vine.boolean().optional(),
      neighborhoodId: vine.number().min(1).optional(),
      organizationId: vine.number().min(1).optional(),
      organizationLocationId: vine.number().min(1).optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      search: ValidatorUtil.searchSchema(),
      sponsorId: vine.number().min(1).optional(),
      ...dateFilters.getProperties(),
    })
    .merge(
      ValidatorUtil.singleOrMultipleOrderBySchema([
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
    .merge(ValidatorUtil.searchBySchema(searchByOptions))
)

const show = vine.compile(vine.object({}).merge(counts).merge(includes))

const update = vine.compile(
  vine.object({
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    middleName: vine.string().nullable().optional(),
    nameSuffix: vine.string().nullable().optional(),
  })
)

update.messagesProvider = new SimpleMessagesProvider({
  'isApplicationAdmin.literal':
    'The {{field}} must be false. To set to true, make a POST request to /admin-invitations instead.',
})

export type { IndexPayload, UpdatePayload }

export default {
  countOptions,
  includeOptions,
  index,
  searchByOptions,
  show,
  update,
}
