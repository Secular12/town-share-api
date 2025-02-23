import { UserPhoneNumberFactory } from '#database/factories/user_phone_number_factory'
import { UserPhoneNumberSeederData } from '#types/seeder'
import AppBaseSeeder from '#database/seeders/app_base_seeder'

export default class UserPhoneNumberSeeder extends AppBaseSeeder {
  public static async runWith(userPhoneNumbersData: UserPhoneNumberSeederData[]) {
    const userPhoneNumberItems = this.getItems(userPhoneNumbersData)

    const userPhoneNumbers = await UserPhoneNumberFactory.merge(userPhoneNumberItems).createMany(
      userPhoneNumberItems.length
    )

    for await (const userPhoneNumber of userPhoneNumbers) {
      await userPhoneNumber.refresh()
    }

    return userPhoneNumbers
  }
}
