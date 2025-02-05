import { PendingUserFactory } from '#database/factories/pending_user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { invitePendingApplicationAdmin } from '#database/seeders/development/dates'

export default class extends BaseSeeder {
  async run() {
    const pendingUserItems = [
      {
        // id: 1
        // adminInvitation: 1
        email: 'application-admin-2@townshare.com',
        createdAt: invitePendingApplicationAdmin,
        updatedAt: invitePendingApplicationAdmin,
      },
    ]

    await PendingUserFactory.merge(pendingUserItems).createMany(pendingUserItems.length)
  }
}
