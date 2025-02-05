import { OrganizationLocationFactory } from '#database/factories/organization_location_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const organizationLocations = [
  // {
  //   organizationId: 1,
  //   neighborhoodId: 1,
  //   city: 'Pittsburgh',
  //   state: 'Pennsylvania',
  // },
]

export default class extends BaseSeeder {
  async run() {
    await OrganizationLocationFactory.merge(organizationLocations).createMany(
      organizationLocations.length
    )
  }
}
