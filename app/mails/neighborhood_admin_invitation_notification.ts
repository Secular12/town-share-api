import Neighborhood from '#models/neighborhood'
import User from '#models/user'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

type NeighborhoodAdminInvitationNotificationPayload = {
  inviter: User
  message?: string | null
  neighborhood: Neighborhood
  recipients: { to: string }
  token: {
    expiration: string | null
    value: string
  }
}

export default class NeighborhoodAdminInvitationNotification extends BaseMail {
  form = env.get('MAIL_FROM_NOTIFICATIONS_DEFAULT_EMAIL')
  subject = `[${env.get('APP_NAME')}] You're invited to be a neighborhood admin`

  constructor(private payload: NeighborhoodAdminInvitationNotificationPayload) {
    super()
  }

  private get email() {
    return app.inProduction ? this.payload.recipients.to : env.get('MAIL_TO_OVERRIDE_EMAIL')!
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const invitationLink = env
      .get('UI_ROUTE_NEIGHBORHOOD_ADMIN_INVITATION')
      .replace('{TOKEN}', encodeURIComponent(this.payload.token.value))

    const viewState = {
      expiration: this.payload.token.expiration,
      invitationLink,
      inviter: this.payload.inviter,
      message: this.payload.message,
      neighborhood: this.payload.neighborhood,
    }

    this.message
      .to(this.email)
      .replyTo(env.get('MAIL_NO_REPLY_EMAIL'))
      .htmlView('emails/neighborhood_admin_invitation_html', viewState)
      .textView('emails/admin_invitation_text', viewState)
  }
}
