import { OrganizationFactory } from '#database/factories/organization_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const organizations = [
  // {
  //   name: 'Auburn Community Group',
  // },
  // {
  //   name: 'Pittsburgh Share',
  // },
  // {
  //   name: 'Seattle Share',
  // },
]

export default class extends BaseSeeder {
  async run() {
    await OrganizationFactory.merge(organizations).createMany(organizations.length)
  }
}
