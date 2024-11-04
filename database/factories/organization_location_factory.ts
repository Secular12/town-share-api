import OrganizationLocation from '#models/organization_location'
import factory from '@adonisjs/lucid/factories'

export const OrganizationLocationFactory = factory
  .define(OrganizationLocation, async ({ faker }) => {
    return {
      city: faker.location.city(),
      name: faker.lorem.words({ min: 1, max: 3 }),
      state: faker.location.state(),
      street: faker.location.streetAddress(),
      zip: faker.location.zipCode(),
    }
  })
  .build()
