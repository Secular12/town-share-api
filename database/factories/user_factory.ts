import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import FakerUtils from '#utils/faker'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      email: faker.internet.email({ firstName, lastName }),
      firstName,
      isApplicationAdmin: faker.datatype.boolean(0.1),
      lastName,
      middleName: FakerUtils.randomCall(faker.person.middleName, 0.2),
      nameSuffix: FakerUtils.randomCall(faker.person.suffix, 0.1),
      password: 'Change-Me-1',
      deactivatedAt: null,
    }
  })
  .build()
