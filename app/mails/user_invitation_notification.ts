import User from '#models/user'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

type UserInvitationNotificationPayload = {
  inviter: User
  recipients: { to: string }
}

export default class UserInvitationNotification extends BaseMail {
  from = env.get('MAIL_FROM_NOTIFICATIONS_DEFAULT_EMAIL')
  subject = `[${env.get('APP_NAME')}] You've been invited`

  constructor(private payload: UserInvitationNotificationPayload) {
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
    const viewState = {
      inviter: this.payload.inviter,
      invitationLink: env.get('UI_ROUTE_USER_INVITATION'),
    }

    this.message
      .to(this.email)
      .replyTo(env.get('MAIL_NO_REPLY_EMAIL'))
      .htmlView('emails/user_invitation_html', viewState)
      .textView('emails/user_invitation_text', viewState)
  }
}
