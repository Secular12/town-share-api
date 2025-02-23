import { AdminInvitationFactory } from '#database/factories/admin_invitation_factory'
import AdminInvitationNotification from '#mails/admin_invitation_notification'
import AdminInvitation from '#models/admin_invitation'
import { AdminInvitationSeederData } from '#types/seeder'
import AppBaseSeeder from '#database/seeders/app_base_seeder'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import env from '#start/env'

export default class AdminInvitationSeeder extends AppBaseSeeder {
  public static async runWith(adminInvitationsData: AdminInvitationSeederData[]) {
    const adminInvitationItems = this.getItems(adminInvitationsData)

    const adminInvitations = await AdminInvitationFactory.merge(adminInvitationItems).createMany(
      adminInvitationsData.length
    )

    for await (const adminInvitation of adminInvitations) {
      await adminInvitation.refresh()

      if (!adminInvitation.isPending) continue

      const token = await AdminInvitation.adminInvitationTokens.create(adminInvitation)

      await adminInvitation.load('inviter')
      await adminInvitation.load('pendingUser')
      await adminInvitation.load('user')

      mail.send(
        new AdminInvitationNotification({
          recipients: { to: adminInvitation.user?.email ?? adminInvitation.pendingUser?.email },
          // TODO UI URL in dev and test .env
          invitationLinkUrl: `${env.get('SEEDER_NOTIFICATION_UI_URL')}/admin-invitation?token={TOKEN}`,
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

    return adminInvitations
  }
}
