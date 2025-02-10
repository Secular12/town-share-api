import User from '#models/user'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

type AdminInvitationNotificationPayload = {
  invitationLinkUrl: string
  inviter: User
  message?: string | null
  recipients: { to: string }
  token: {
    expiration: string | null
    value: string
  }
}

export default class AdminInvitationNotification extends BaseMail {
  form = env.get('MAIL_FROM_NOTIFICATIONS_DEFAULT_EMAIL')
  subject = `[${env.get('APP_NAME')}] You're invited to be an admin`

  constructor(private payload: AdminInvitationNotificationPayload) {
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
    const invitationLink = this.payload.invitationLinkUrl.replace(
      '{TOKEN}',
      encodeURIComponent(this.payload.token.value)
    )

    const viewState = {
      expiration: this.payload.token.expiration,
      invitationLink,
      inviter: this.payload.inviter,
      message: this.payload.message,
    }

    this.message
      .to(this.email)
      .replyTo(env.get('MAIL_NO_REPLY_EMAIL'))
      .htmlView('emails/admin_invitation_html', viewState)
      .textView('emails/admin_invitation_text', viewState)
  }
}
