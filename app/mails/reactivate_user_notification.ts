import User from '#models/user'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

type ReactivateUserNotificationPayload = {
  recipients: {
    to: string
  }
  user: User
}

export default class ReactivateUserNotification extends BaseMail {
  form = env.get('MAIL_FROM_NOTIFICATIONS_DEFAULT_EMAIL')
  subject = `[${env.get('APP_NAME')}] Your account has been reactivated`

  constructor(private payload: ReactivateUserNotificationPayload) {
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
      user: this.payload.user,
    }

    this.message
      .to(this.email)
      .replyTo(env.get('MAIL_NO_REPLY_EMAIL'))
      .htmlView('emails/reactivate_user_html', viewState)
      .textView('emails/reactivate_user_text', viewState)
  }
}
