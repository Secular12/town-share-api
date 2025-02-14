import { UserFactory } from '#database/factories/user_factory'
import NeighborhoodUserLocation from '#models/neighborhood_user_location'
import factory from '@adonisjs/lucid/factories'

export const NeighborhoodUserLocationFactory = factory
  .define(NeighborhoodUserLocation, async ({ faker }) => {
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
