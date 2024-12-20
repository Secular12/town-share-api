import { NeighborhoodFactory } from '#database/factories/neighborhood_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const neighborhoods = [
  {
    city: 'Pittsburgh',
    name: 'North Hills',
    state: 'Pennsylvania',
    zip: '15090',
  },
  {
    city: 'Pittsburgh',
    name: 'East Side',
    state: 'Pennsylvania',
    zip: '15112',
  },
  {
    city: 'Seattle',
    name: 'Downtown',
    state: 'Washington',
    zip: '98101',
  },
  {
    city: 'Sedona',
    name: 'Sedona Central',
    state: 'Arizona',
    zip: '86336',
  },
]

export default class extends BaseSeeder {
  async run() {
    await NeighborhoodFactory.merge(neighborhoods).createMany(neighborhoods.length)
  }
}
