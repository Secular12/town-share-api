import Neighborhood from '#models/neighborhood'
import factory from '@adonisjs/lucid/factories'

export const NeighborhoodFactory = factory
  .define(Neighborhood, async ({ faker }) => {
    return {
      city: faker.location.city(),
      name: faker.lorem.words({ min: 1, max: 3 }),
      state: faker.location.state(),
    }
  })
  .build()
