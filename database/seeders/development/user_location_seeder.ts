import { UserLocationFactory } from '#database/factories/user_location_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const userLocations = [
  {
    neighborhoodId: 1,
    userId: 2,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 2,
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
    neighborhoodId: 1,
    userId: 4,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
  },
  {
    neighborhoodId: 2,
    userId: 5,
    city: 'Seattle',
    state: 'Washington',
  },
  {
    neighborhoodId: 2,
    userId: 5,
    city: 'Seattle',
    state: 'Washington',
  },
]

export default class extends BaseSeeder {
  async run() {
    await UserLocationFactory.merge(userLocations).createMany(userLocations.length)
  }
}
