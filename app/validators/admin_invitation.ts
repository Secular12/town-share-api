import AdminInvitation from '#models/admin_invitation'
import ValidatorUtil from '#utils/validator'
import PasswordValidatorSchema from '#validators/schemas/password'
import PhoneNumberValidatorSchema from '#validators/schemas/phone_number'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const dateFilters = ValidatorUtil.dateFiltersSchema([
  'acceptedAt',
  'createdAt',
  'deniedAt',
  'revokedAt',
  'updatedAt',
] as const)

const preloadOptions = [
  'inviter',
  'user',
  'user.phoneNumbers',
  'user.sponsor',
  'pendingUser',
] as const

const includeOptions = ValidatorUtil.getIncludeOptions(preloadOptions)

const searchByOptions = ['email', 'inviterName', 'userName'] as const

type IndexPayload = Awaited<ReturnType<(typeof index)['validate']>>

const includes = ValidatorUtil.includeSchema(includeOptions)

const storeUserGroup = vine.group([
  vine.group.if((data) => data.userId, {
    userId: vine.number().min(1),
  }),
  vine.group.if((data) => data.pendingUserId, {
    pendingUserId: vine.number().min(1),
  }),
  vine.group.else({
    email: vine.string().email(),
  }),
])

const revokeUserGroup = vine.group([
  vine.group.if((data) => data.userId, {
    userId: vine.number().min(1),
  }),
  vine.group.if((data) => data.pendingUserId, {
    pendingUserId: vine.number().min(1),
  }),
])

const getAcceptGroup = (adminInvitation: AdminInvitation) =>
  vine.group([
    vine.group.if((_data) => adminInvitation.pendingUserId, {
      firstName: vine.string(),
      lastName: vine.string(),
      middleName: vine.string().nullable().optional(),
      nameSuffix: vine.string().nullable().optional(),
      password: PasswordValidatorSchema.password
        .clone()
        .confirmed({ confirmationField: 'passwordConfirmation' }),
      phoneNumbers: vine.array(PhoneNumberValidatorSchema.create).optional(),
    }),
  ])

const token = vine.compile(
  vine.object({
    token: vine.string(),
  })
)

const accept = (adminInvitation: AdminInvitation) => {
  const acceptGroup = getAcceptGroup(adminInvitation)
  return vine.compile(vine.object({}).merge(acceptGroup))
}

const index = vine.compile(
  vine
    .object({
      inviterId: vine.number().min(1).optional(),
      isPending: vine.boolean().optional(),
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      search: ValidatorUtil.searchSchema(),
      userId: vine.number().min(1).optional(),
      ...dateFilters.getProperties(),
    })
    .merge(
      ValidatorUtil.singleOrMultipleOrderBySchema([
        'id',
        'inviterName',
        'userName',
        'acceptedAt',
        'createdAt',
        'deniedAt',
        'updatedAt',
      ])
    )
    .merge(includes)
    .merge(ValidatorUtil.searchBySchema(searchByOptions))
)

const resend = vine.compile(
  vine.object({
    message: vine.string().nullable().optional(),
    timezone: vine.string().trim().timezone(),
  })
)

const revoke = vine.compile(vine.object({}).merge(revokeUserGroup))

const show = vine.compile(vine.object({}).merge(includes))

const store = vine.compile(
  vine
    .object({
      message: vine.string().nullable().optional(),
      timezone: vine.string().trim().timezone(),
    })
    .merge(storeUserGroup)
)

store.messagesProvider = new SimpleMessagesProvider({
  'email.required': 'The email, userId, or pendingUserId field must be defined',
})
export type { IndexPayload }

export default {
  accept,
  includeOptions,
  index,
  preloadOptions,
  resend,
  revoke,
  searchByOptions,
  show,
  store,
  token,
}
