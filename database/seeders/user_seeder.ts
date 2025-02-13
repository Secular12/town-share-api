import { UserFactory } from '#database/factories/user_factory'
import AdminInvitationSeeder from '#database/seeders/admin_invitation_seeder'
import BaseSeeder from '#database/seeders/base_seeder'
import UserPhoneNumberSeeder from '#database/seeders/user_phone_number_seeder'
import { UserSeederData } from '#types/seeder'

export default class UserSeeder extends BaseSeeder {
  public static async runWith(userData: UserSeederData[]) {
    const userItems = this.getItems(userData)

    const users = await UserFactory.merge(userItems).createMany(userItems.length)

    for await (const [userIndex, user] of users.entries()) {
      await users[userIndex].refresh()

      if (userData[userIndex].receivedAdminInvitations) {
        await AdminInvitationSeeder.runWith(
          userData[userIndex].receivedAdminInvitations.map((adminInvitation) => {
            return { ...adminInvitation, userId: user.id }
          })
        )

        await users[userIndex].load('receivedAdminInvitations')
      }

      if (userData[userIndex].phoneNumbers) {
        await UserPhoneNumberSeeder.runWith(
          userData[userIndex].phoneNumbers.map((phoneNumber) => {
            return { ...phoneNumber, userId: user.id }
          })
        )

        await users[userIndex].load('phoneNumbers')
      }
    }

    return users
  }

  private static getItems(userData: UserSeederData[]) {
    return this.mapData(userData, (data) => ({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      isApplicationAdmin: data.isApplicationAdmin,
      lastName: data.lastName,
      middleName: data.middleName,
      nameSuffix: data.nameSuffix,
      password: data.password,
      createdAt: data.createdAt,
      deactivatedAt: data.deactivatedAt,
      updatedAt: data.updatedAt,
    }))
  }
}
