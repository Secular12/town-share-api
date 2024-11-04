import Organization from '#models/organization'
import factory from '@adonisjs/lucid/factories'

export const OrganizationFactory = factory
  .define(Organization, async ({ faker }) => {
    return {
      name: faker.company.name(),
    }
  })
  .build()
