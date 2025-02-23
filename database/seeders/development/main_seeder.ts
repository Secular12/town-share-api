import {
  appStart,
  joinedAuburnNeighborhoodAdmin,
  invitePendingApplicationAdmin,
  inviteAuburnNeighborhoodAdmin,
} from '#database/seeders/development/dates'
import NeighborhoodSeeder from '#database/seeders/neighborhood_seeder'
import PendingUserSeeder from '#database/seeders/pending_user_seeder'
import UserSeeder from '#database/seeders/user_seeder'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class MainSeeder extends BaseSeeder {
  async run() {
    await UserSeeder.runWith([
      {
        data: {
          id: 1,
          email: 'application-admin@townshare.com',
          isApplicationAdmin: true,
          password: 'Secret123!',
          createdAt: appStart,
        },
        phoneNumbers: [
          {
            data: {
              createdAt: appStart,
            },
          },
          {
            data: {
              createdAt: appStart,
            },
          },
        ],
      },
    ])

    await PendingUserSeeder.runWith([
      {
        data: {
          id: 1,
          email: 'application-admin-2@townshare.com',
          createdAt: invitePendingApplicationAdmin,
          updatedAt: invitePendingApplicationAdmin,
        },
        receivedAdminInvitations: [
          {
            data: {
              inviterId: 1,
              createdAt: invitePendingApplicationAdmin,
              updatedAt: invitePendingApplicationAdmin,
            },
          },
        ],
      },
    ])

    await NeighborhoodSeeder.runWith([
      {
        data: {
          id: 1,
          city: 'Seattle',
          name: 'Auburn',
          state: 'Washington',
          createdAt: appStart,
          updatedAt: appStart,
        },
      },
    ])

    await UserSeeder.runWith([
      {
        data: {
          id: 2,
          sponsorId: 1,
          email: 'seattle-neighborhoods-admin@townshare.com',
          isApplicationAdmin: false,
          password: 'Secret123!',
          createdAt: joinedAuburnNeighborhoodAdmin,
        },
        neighborhoods: [
          {
            data: {
              neighborhood_id: 1,
              is_neighborhood_admin: true,
            },
          },
        ],
        receivedNeighborhoodAdminInvitations: [
          {
            data: {
              inviterId: 1,
              neighborhoodId: 1,
              acceptedAt: joinedAuburnNeighborhoodAdmin,
              createdAt: inviteAuburnNeighborhoodAdmin,
            },
          },
        ],
        phoneNumbers: [
          {
            data: {
              createdAt: joinedAuburnNeighborhoodAdmin,
            },
          },
        ],
      },
    ])
  }
}
