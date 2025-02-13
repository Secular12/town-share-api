import { PendingUserFactory } from '#database/factories/pending_user_factory'
import AdminInvitationSeeder from '#database/seeders/admin_invitation_seeder'
import { PendingUserSeederData } from '#types/seeder'
import BaseSeeder from '#database/seeders/base_seeder'

export default class PendingUserSeeder extends BaseSeeder {
  public static async runWith(pendingUserData: PendingUserSeederData[]) {
    const pendingUserItems = this.getItems(pendingUserData)

    const pendingUsers = await PendingUserFactory.merge(pendingUserItems).createMany(
      pendingUserItems.length
    )

    for await (const [pendingUserIndex, pendingUser] of pendingUsers.entries()) {
      await pendingUsers[pendingUserIndex].refresh()

      if (pendingUserData[pendingUserIndex].receivedAdminInvitations) {
        await AdminInvitationSeeder.runWith(
          pendingUserData[pendingUserIndex].receivedAdminInvitations.map((adminInvitation) => {
            return { ...adminInvitation, pendingUserId: pendingUser.id }
          })
        )

        await pendingUsers[pendingUserIndex].load('receivedAdminInvitations')
      }
    }

    return pendingUsers
  }

  private static getItems(userData: PendingUserSeederData[]) {
    return this.mapData(userData, (data) => {
      return {
        id: data.id,
        email: data.email,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    })
  }
}
