import { NeighborhoodFactory } from '#database/factories/neighborhood_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const neighborhoods = [
  {
    city: 'Pittsburgh',
    name: 'North Hills',
    state: 'Pennsylvania',
  },
  {
    city: 'Seattle',
    name: 'Downtown',
    state: 'Washington',
  },
]

export default class extends BaseSeeder {
  async run() {
    await NeighborhoodFactory.merge(neighborhoods).createMany(neighborhoods.length)
  }
}
