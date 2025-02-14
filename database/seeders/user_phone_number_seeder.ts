import { UserPhoneNumberFactory } from '#database/factories/user_phone_number_factory'
import { UserPhoneNumberSeederData } from '#types/seeder'
import AppBaseSeeder from '#database/seeders/app_base_seeder'

export default class UserPhoneNumberSeeder extends AppBaseSeeder {
  public static async runWith(userPhoneNumberData: UserPhoneNumberSeederData[]) {
    const userPhoneNumberItems = this.getItems(userPhoneNumberData)

    return UserPhoneNumberFactory.merge(userPhoneNumberItems).createMany(
      userPhoneNumberItems.length
    )
  }

  private static getItems(userPhoneNumberData: UserPhoneNumberSeederData[]) {
    return this.mapData(userPhoneNumberData, (data) => ({
      id: data.id,
      userId: data.userId,
      countryCode: data.countryCode,
      extension: data.extension,
      phone: data.phone,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }))
  }
}
