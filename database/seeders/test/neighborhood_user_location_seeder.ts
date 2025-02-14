import { NeighborhoodUserLocationFactory } from '#database/factories/neighborhood_user_location_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const neighborhoodUserLocations = [
  {
    neighborhoodId: 1,
    userId: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 1,
    userId: 3,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 2,
    userId: 3,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 3,
    userId: 6,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    neighborhoodId: 3,
    userId: 6,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    neighborhoodId: 2,
    userId: 9,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 3,
    userId: 12,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    neighborhoodId: 3,
    userId: 12,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    neighborhoodId: 1,
    userId: 15,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 2,
    userId: 15,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 1,
    userId: 16,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 2,
    userId: 16,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 3,
    userId: 16,
    city: 'Seattle',
    state: 'Washington',
  },
]

export default class extends BaseSeeder {
  async run() {
    await NeighborhoodUserLocationFactory.merge(neighborhoodUserLocations).createMany(
      neighborhoodUserLocations.length
    )
  }
}
