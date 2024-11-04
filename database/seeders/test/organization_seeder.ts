import { OrganizationFactory } from '#database/factories/organization_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const organizations = [
  { name: 'East Side Co-Op' },
  { name: 'USA Share' },
  { name: 'Seattle Share' },
]

export default class extends BaseSeeder {
  async run() {
    await OrganizationFactory.merge(organizations).createMany(organizations.length)
  }
}
