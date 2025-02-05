import { AdminInvitationFactory } from '#database/factories/admin_invitation_factory'
import AdminInvitationNotification from '#mails/admin_invitation_notification'
import AdminInvitation from '#models/admin_invitation'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import { invitePendingApplicationAdmin } from './dates.js'

export default class extends BaseSeeder {
  async run() {
    const adminInvitationItems = [
      {
        // id: 1
        inviterId: 1,
        pendingUserId: 1,
        userId: null,
        message: 'From seeding.',
        createdAt: invitePendingApplicationAdmin,
        updatedAt: invitePendingApplicationAdmin,
      },
    ]

    const adminInvitations = await AdminInvitationFactory.merge(adminInvitationItems).createMany(
      adminInvitationItems.length
    )

    for await (const adminInvitation of adminInvitations) {
      const token = await AdminInvitation.adminInvitationTokens.create(adminInvitation)

      await adminInvitation.load('inviter')
      await adminInvitation.load('pendingUser')
      await adminInvitation.load('user')

      await mail.send(
        new AdminInvitationNotification({
          recipient: adminInvitation.user?.email ?? adminInvitation.pendingUser?.email,
          invitationLinkUrl: 'https://townshare.dev/admin-invitation?token={TOKEN}',
          inviter: adminInvitation.inviter,
          message: adminInvitation.message,
          token: {
            expiration: token.expiresAt
              ? DateTime.fromJSDate(token.expiresAt)
                  .setZone('America/New_York')
                  .toLocaleString(DateTime.DATETIME_FULL)
              : null,
            value: token.value!.release(),
          },
        })
      )
    }
  }
}
