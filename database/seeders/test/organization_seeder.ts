import { OrganizationFactory } from '#database/factories/organization_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const organizations = [
  // 1
  { name: 'East Side Co-Op' },
  // 2
  { name: 'USA Share' },
  // 3
  { name: 'Seattle Share' },
]

export default class extends BaseSeeder {
  async run() {
    await OrganizationFactory.merge(organizations).createMany(organizations.length)
  }
}
