import { OrganizationLocationFactory } from '#database/factories/organization_location_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const organizationLocations = [
  {
    organizationId: 1,
    neighborhoodId: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    organizationId: 2,
    neighborhoodId: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    organizationId: 2,
    neighborhoodId: 3,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    organizationId: 3,
    neighborhoodId: 3,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    organizationId: 3,
    neighborhoodId: 3,
    city: 'Seattle',
    state: 'Washington',
  },
]

export default class extends BaseSeeder {
  async run() {
    await OrganizationLocationFactory.merge(organizationLocations).createMany(
      organizationLocations.length
    )
  }
}
