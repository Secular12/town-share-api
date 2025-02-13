import {
  appStart,
  joinedAuburnNeighborhoodAdmin,
  invitePendingApplicationAdmin,
} from '#database/seeders/development/dates'
import NeighborhoodSeeder from '#database/seeders/neighborhood_seeder'
import PendingUserSeeder from '#database/seeders/pending_user_seeder'
import UserSeeder from '#database/seeders/user_seeder'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class MainSeeder extends BaseSeeder {
  async run() {
    await UserSeeder.runWith([
      {
        id: 1,
        email: 'application-admin@townshare.com',
        isApplicationAdmin: true,
        password: 'Secret123!',
        createdAt: appStart,
        updatedAt: appStart,
        phoneNumbers: [
          {
            createdAt: appStart,
            updatedAt: appStart,
          },
          {
            createdAt: appStart,
            updatedAt: appStart,
          },
        ],
      },
      {
        id: 2,
        sponsorId: 1,
        email: 'seattle-neighborhoods-admin@townshare.com',
        isApplicationAdmin: false,
        password: 'Secret123!',
        createdAt: joinedAuburnNeighborhoodAdmin,
        updatedAt: joinedAuburnNeighborhoodAdmin,
        phoneNumbers: [
          {
            createdAt: joinedAuburnNeighborhoodAdmin,
            updatedAt: joinedAuburnNeighborhoodAdmin,
          },
        ],
      },
    ])

    await PendingUserSeeder.runWith([
      {
        email: 'application-admin-2@townshare.com',
        createdAt: invitePendingApplicationAdmin,
        updatedAt: invitePendingApplicationAdmin,
        receivedAdminInvitations: [
          {
            inviterId: 1,
            createdAt: invitePendingApplicationAdmin,
            updatedAt: invitePendingApplicationAdmin,
          },
        ],
      },
    ])

    await NeighborhoodSeeder.runWith([
      {
        city: 'Seattle',
        name: 'Auburn',
        state: 'Washington',
        createdAt: appStart,
        updatedAt: appStart,
      },
    ])
  }
}
