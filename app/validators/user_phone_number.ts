import vine from '@vinejs/vine'
import ValidatorUtil from '#utils/validator'
import PhoneNumberValidatorSchema from '#validators/schemas/phone_number'

const dateFilters = ValidatorUtil.dateFiltersSchema(['createdAt', 'updatedAt'] as const)

const includeOptions = ['user'] as const

const includes = ValidatorUtil.includeSchema(includeOptions)

const index = vine.compile(
  vine
    .object({
      page: vine.number().min(1),
      perPage: vine.number().max(100).min(1),
      userId: vine.number().min(1).optional(),
      ...dateFilters.getProperties(),
    })
    .merge(
      ValidatorUtil.singleOrMultipleOrderBySchema([
        'id',
        'countryCode',
        'extension',
        'phone',
        'createdAt',
        'updatedAt',
      ] as const)
    )
    .merge(includes)
)

const show = vine.compile(vine.object({}).merge(includes))

const store = vine.compile(
  vine.object({
    userId: vine.number().min(1),
    ...PhoneNumberValidatorSchema.create.getProperties(),
  })
)

const update = vine.compile(PhoneNumberValidatorSchema.update)

export default {
  index,
  show,
  store,
  update,
}
