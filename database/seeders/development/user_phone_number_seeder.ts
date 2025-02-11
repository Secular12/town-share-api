import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { appStart, joinedAuburnNeighborhoodAdmin } from '#database/seeders/development/dates'
import { UserPhoneNumberFactory } from '#database/factories/user_phone_number_factory'

export default class extends BaseSeeder {
  async run() {
    const userPhoneNumberItems = [
      {
        // id: 1,
        userId: 1,
        countryCode: '1',
        extension: null,
        createdAt: appStart,
        updatedAt: appStart,
      },
      {
        // id: 2,
        userId: 1,
        countryCode: '1',
        extension: null,
        createdAt: appStart,
        updatedAt: appStart,
      },
      {
        // id: 3,
        userId: 2,
        countryCode: '1',
        extension: null,
        createdAt: joinedAuburnNeighborhoodAdmin,
        updatedAt: joinedAuburnNeighborhoodAdmin,
      },
    ]

    await UserPhoneNumberFactory.merge(userPhoneNumberItems).createMany(userPhoneNumberItems.length)
  }
}
