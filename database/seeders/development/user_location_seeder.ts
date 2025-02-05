import { UserLocationFactory } from '#database/factories/user_location_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export const userLocations = [
  // {
  //   // id: 1
  //   neighborhoodId: 1,
  //   userId: 4,
  //   city: 'Seattle',
  //   state: 'Washington',
  // },
]

export default class extends BaseSeeder {
  async run() {
    await UserLocationFactory.merge(userLocations).createMany(userLocations.length)
  }
}
