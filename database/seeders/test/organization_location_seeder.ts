import { OrganizationLocationFactory } from '#database/factories/organization_location_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const organizationLocations = [
  // 1
  {
    organizationId: 1,
    neighborhoodId: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  // 2
  {
    organizationId: 2,
    neighborhoodId: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  // 3
  {
    organizationId: 2,
    neighborhoodId: 3,
    city: 'Seattle',
    state: 'Washington',
  },
  // 4
  {
    organizationId: 3,
    neighborhoodId: 3,
    city: 'Seattle',
    state: 'Washington',
  },
  // 5
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
