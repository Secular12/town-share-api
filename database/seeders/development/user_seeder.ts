import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const userItems = [
      {
        email: 'super-admin@townshare.com',
        isAdmin: true,
        password: 'Secret1!',
      },
      {
        email: 'user@townshare.com',
        isAdmin: false,
        password: 'Secret1!',
      },
    ]

    await UserFactory.merge(userItems).createMany(userItems.length)
  }
}
