import { AdminInvitationFactory } from '#database/factories/admin_invitation_factory'
import AdminInvitationNotification from '#mails/admin_invitation_notification'
import AdminInvitation from '#models/admin_invitation'
import { AdminInvitationSeederData } from '#types/seeder'
import BaseSeeder from '#database/seeders/base_seeder'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class AdminInvitationSeeder extends BaseSeeder {
  public static async runWith(adminInvitationData: AdminInvitationSeederData[]) {
    const adminInvitationItems = this.getItems(adminInvitationData)

    const adminInvitations = await AdminInvitationFactory.merge(adminInvitationItems).createMany(
      adminInvitationData.length
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

    return adminInvitations
  }

  private static getItems(adminInvitationData: AdminInvitationSeederData[]) {
    return this.mapData(adminInvitationData, (data) => {
      return {
        id: data.id,
        inviterId: data.inviterId,
        pendingUserId: 'pendingUserId' in data ? data.pendingUserId : undefined,
        userId: 'userId' in data ? data.userId : undefined,
        message: data.message,
        acceptedAt: 'acceptedAt' in data ? data.acceptedAt : undefined,
        createdAt: data.createdAt,
        deniedAt: 'deniedAt' in data ? data.deniedAt : undefined,
        revokedAt: data.revokedAt,
        updatedAt: data.updatedAt,
      }
    })
  }
}
