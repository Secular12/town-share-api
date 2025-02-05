import factory from '@adonisjs/lucid/factories'
import FakerUtils from '#utils/faker'
import UserPhoneNumber from '#models/user_phone_number'

export const UserPhoneNumberFactory = factory
  .define(UserPhoneNumber, async ({ faker }) => {
    return {
      countryCode: '1',
      extension: FakerUtils.randomCall(
        () => faker.string.numeric({ length: { max: 4, min: 1 } }),
        0.1
      ),
      phone: faker.string.numeric(10),
    }
  })
  .build()
