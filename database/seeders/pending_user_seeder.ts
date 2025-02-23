import { PendingUserFactory } from '#database/factories/pending_user_factory'
import AdminInvitationSeeder from '#database/seeders/admin_invitation_seeder'
import AppBaseSeeder from '#database/seeders/app_base_seeder'
import NeighborhoodAdminInvitationSeeder from '#database/seeders/neighborhood_admin_invitation_seeder'
import { PendingUserSeederData } from '#types/seeder'

export default class PendingUserSeeder extends AppBaseSeeder {
  public static async runWith(pendingUsersData: PendingUserSeederData[]) {
    const pendingUserItems = this.getItems(pendingUsersData)

    const pendingUsers = await PendingUserFactory.merge(pendingUserItems).createMany(
      pendingUserItems.length
    )

    for await (const [pendingUserIndex, pendingUser] of pendingUsers.entries()) {
      await pendingUser.refresh()

      const pendingUserData = pendingUsersData[pendingUserIndex]

      if (pendingUserData.receivedAdminInvitations) {
        await AdminInvitationSeeder.runWith(
          pendingUserData.receivedAdminInvitations.map((adminInvitation) => {
            return {
              ...adminInvitation,
              data: {
                ...adminInvitation.data,
                pendingUserId: pendingUser.id,
              },
            }
          })
        )

        await pendingUser.load('receivedAdminInvitations')
      }

      if (pendingUserData.receivedNeighborhoodAdminInvitations) {
        await NeighborhoodAdminInvitationSeeder.runWith(
          pendingUserData.receivedNeighborhoodAdminInvitations.map((adminInvitation) => {
            return {
              ...adminInvitation,
              data: {
                ...adminInvitation.data,
                pendingUserId: pendingUser.id,
              },
            }
          })
        )

        await pendingUser.load('receivedNeighborhoodAdminInvitations')
      }
    }

    return pendingUsers
  }
}
