import { NeighborhoodFactory } from '#database/factories/neighborhood_factory'
import { appStart } from '#database/seeders/development/dates'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const neighborhoods = [
  {
    // id: 1
    city: 'Seattle',
    name: 'Auburn',
    state: 'Washington',
    createdAt: appStart,
    updatedAt: appStart,
  },
]

export default class extends BaseSeeder {
  async run() {
    await NeighborhoodFactory.merge(neighborhoods).createMany(neighborhoods.length)
  }
}
