import { UserFactory } from '#database/factories/user_factory'
import UserLocation from '#models/user_location'
import factory from '@adonisjs/lucid/factories'

export const UserLocationFactory = factory
  .define(UserLocation, async ({ faker }) => {
    return {
      city: faker.location.city(),
      name: faker.lorem.words({ min: 1, max: 3 }),
      state: faker.location.state(),
      street: faker.location.streetAddress(),
      zip: faker.location.zipCode(),
    }
  })
  .relation('user', UserFactory)
  .build()
