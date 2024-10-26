import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const userItems = [
      {
        email: 'admin@test.com',
        firstName: 'Admin',
        isAdmin: true,
        lastName: 'Service',
        middleName: 'Test',
        nameSuffix: 'unit',
        password: 'Secret1!',
      },
      {
        email: 'user@test.com',
        firstName: 'User',
        isAdmin: false,
        lastName: 'Service',
        middleName: 'Test',
        nameSuffix: 'unit',
        password: 'Secret1!',
      },
    ]

    await UserFactory.merge(userItems).createMany(userItems.length)
  }
}
