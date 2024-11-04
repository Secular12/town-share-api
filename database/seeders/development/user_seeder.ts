import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const userItems = [
      {
        email: 'application-admin@townshare.com',
        isApplicationAdmin: true,
        password: 'Secret123!',
      },
      {
        email: 'user@example.com',
        isApplicationAdmin: false,
        password: 'Secret123!',
      },
      {
        email: 'admin@pittsburgh-share.com',
        isApplicationAdmin: true,
        password: 'Secret123!',
      },
      {
        email: 'user@pittsburgh-share.com',
        isApplicationAdmin: false,
        password: 'Secret123!',
      },
      {
        email: 'admin@seattle-share.com',
        isApplicationAdmin: true,
        password: 'Secret123!',
      },
      {
        email: 'user@seattle-share.com',
        isApplicationAdmin: false,
        password: 'Secret123!',
      },
    ]

    await UserFactory.merge(userItems).createMany(userItems.length)
  }
}
