import Neighborhood from '#models/neighborhood'
import FakerUtil from '#utils/faker'
import factory from '@adonisjs/lucid/factories'

export const NeighborhoodFactory = factory
  .define(Neighborhood, async ({ faker }) => {
    const state = faker.location.state()

    return {
      city: faker.location.city(),
      country: 'United States of America',
      name: faker.lorem.words({ min: 1, max: 3 }),
      state,
      zip: FakerUtil.randomCall(() => faker.location.zipCode({ state }), 0.8),
    }
  })
  .build()
