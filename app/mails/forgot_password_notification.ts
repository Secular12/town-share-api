import User from '#models/user'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

type ForgotPasswordNotificationPayload = {
  recipients: {
    to: string
  }
  user: User
  token: {
    expiration: string | null
    value: string
  }
}

export default class ForgotPasswordNotification extends BaseMail {
  form = env.get('MAIL_FROM_NOTIFICATIONS_DEFAULT_EMAIL')
  subject = `[${env.get('APP_NAME')}] Please reset you password`

  constructor(private payload: ForgotPasswordNotificationPayload) {
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
    const resetLink = env
      .get('UI_ROUTE_RESET_PASSWORD')
      .replace('{TOKEN}', encodeURIComponent(this.payload.token.value))

    const viewState = {
      expiration: this.payload.token.expiration,
      resetLink,
      user: this.payload.user,
    }

    this.message
      .to(this.email)
      .replyTo(env.get('MAIL_NO_REPLY_EMAIL'))
      .htmlView('emails/forgot_password_html', viewState)
      .textView('emails/forgot_password_text', viewState)
  }
}
