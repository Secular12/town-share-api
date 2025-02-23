import { NeighborhoodAdminInvitationFactory } from '#database/factories/neighborhood_admin_invitation_factory'
import NeighborhoodAdminInvitationNotification from '#mails/neighborhood_admin_invitation_notification'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import { NeighborhoodAdminInvitationSeederData } from '#types/seeder'
import AppBaseSeeder from '#database/seeders/app_base_seeder'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import env from '#start/env'

export default class NeighborhoodAdminInvitationSeeder extends AppBaseSeeder {
  public static async runWith(
    neighborhoodAdminInvitationsData: NeighborhoodAdminInvitationSeederData[]
  ) {
    const neighborhoodAdminInvitationItems = this.getItems(neighborhoodAdminInvitationsData)

    const neighborhoodAdminInvitations = await NeighborhoodAdminInvitationFactory.merge(
      neighborhoodAdminInvitationItems
    ).createMany(neighborhoodAdminInvitationsData.length)

    for await (const neighborhoodAdminInvitation of neighborhoodAdminInvitations) {
      await neighborhoodAdminInvitation.refresh()

      if (!neighborhoodAdminInvitation.isPending) continue

      const token = await NeighborhoodAdminInvitation.adminInvitationTokens.create(
        neighborhoodAdminInvitation
      )

      await neighborhoodAdminInvitation.load('inviter')
      await neighborhoodAdminInvitation.load('neighborhood')
      await neighborhoodAdminInvitation.load('pendingUser')
      await neighborhoodAdminInvitation.load('user')

      mail.send(
        new NeighborhoodAdminInvitationNotification({
          recipients: {
            to:
              neighborhoodAdminInvitation.user?.email ??
              neighborhoodAdminInvitation.pendingUser?.email,
          },
          invitationLinkUrl: `${env.get('SEEDER_NOTIFICATION_UI_URL')}/neighborhood-admin-invitation?token={TOKEN}`,
          inviter: neighborhoodAdminInvitation.inviter,
          message: neighborhoodAdminInvitation.message,
          neighborhood: neighborhoodAdminInvitation.neighborhood,
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

    return neighborhoodAdminInvitations
  }
}
