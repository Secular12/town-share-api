import { UserFactory } from '#database/factories/user_factory'
import AdminInvitationSeeder from '#database/seeders/admin_invitation_seeder'
import AppBaseSeeder from '#database/seeders/app_base_seeder'
import NeighborhoodAdminInvitationSeeder from '#database/seeders/neighborhood_admin_invitation_seeder'
import NeighborhoodUserSeeder from '#database/seeders/neighborhood_user_seeder'
import UserPhoneNumberSeeder from '#database/seeders/user_phone_number_seeder'
import { UserSeederData } from '#types/seeder'

export default class UserSeeder extends AppBaseSeeder {
  public static async runWith(usersData: UserSeederData[]) {
    const userItems = this.getItems(usersData)

    const users = await UserFactory.merge(userItems).createMany(userItems.length)

    for await (const [userIndex, user] of users.entries()) {
      await user.refresh()

      const userData = usersData[userIndex]

      if (userData.neighborhoods) {
        await NeighborhoodUserSeeder.runWith(
          userData.neighborhoods.map((neighborhoodUser) => ({
            ...neighborhoodUser,
            data: {
              ...neighborhoodUser.data,
              user_id: user.id,
            },
          }))
        )
      }

      if (userData.phoneNumbers) {
        await UserPhoneNumberSeeder.runWith(
          userData.phoneNumbers.map((phoneNumber) => {
            return {
              ...phoneNumber,
              data: {
                ...phoneNumber.data,
                userId: user.id,
              },
            }
          })
        )

        await user.load('phoneNumbers')
      }

      if (userData.receivedAdminInvitations) {
        await AdminInvitationSeeder.runWith(
          userData.receivedAdminInvitations.map((adminInvitation) => {
            return {
              ...adminInvitation,
              data: {
                ...adminInvitation.data,
                userId: user.id,
              },
            }
          })
        )

        await user.load('receivedAdminInvitations')
      }

      if (userData.receivedNeighborhoodAdminInvitations) {
        await NeighborhoodAdminInvitationSeeder.runWith(
          userData.receivedNeighborhoodAdminInvitations.map((adminInvitation) => {
            return {
              ...adminInvitation,
              data: {
                ...adminInvitation.data,
                userId: user.id,
              },
            }
          })
        )

        await user.load('receivedNeighborhoodAdminInvitations')
      }
    }

    return users
  }
}
