import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import {
  appStart,
  inviteAuburnNeighborhoodAdmin,
  joinedAuburnNeighborhoodAdmin,
} from '#database/seeders/development/dates'

export default class extends BaseSeeder {
  async run() {
    const userItems = [
      {
        // id: 1
        // userLocations:
        // userLocations.neighborhoods:
        // userPhoneNumbers: 1, 2
        // organizations:
        // organizationLocations:
        // organizationLocation.neighborhoods:
        email: 'application-admin@townshare.com',
        isApplicationAdmin: true,
        password: 'Secret123!',
        createdAt: appStart,
        updatedAt: appStart,
      },
      {
        // id: 2
        // userLocations:
        // userLocations.neighborhoods: 1
        // userPhoneNumbers: 3
        // organizations:
        // organizationLocations:
        // organizationLocation.neighborhoods:
        sponsorId: 1,
        email: 'seattle-neighborhood-admin@townshare.com',
        isApplicationAdmin: false,
        password: 'Secret123!',
        createdAt: inviteAuburnNeighborhoodAdmin,
        updatedAt: joinedAuburnNeighborhoodAdmin,
      },
    ]

    await UserFactory.merge(userItems).createMany(userItems.length)
  }
}
