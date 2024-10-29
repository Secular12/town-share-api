import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const userItems = [
      {
        email: 'application-admin@townshare.com',
        isAdmin: true,
        password: 'Secret123!',
      },
      {
        email: 'user@example.com',
        isAdmin: false,
        password: 'Secret123!',
      },
    ]

    await UserFactory.merge(userItems).createMany(userItems.length)
  }
}
