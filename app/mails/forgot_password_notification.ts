import User from '#models/user'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { BaseMail } from '@adonisjs/mail'

type ForgotPasswordNotificationRecipients = {
  user: User
}

type ForgotPasswordNotificationPayload = {
  token: {
    expiration: string | null
    value: string
  }
}

export default class ForgotPasswordNotification extends BaseMail {
  subject = `[${env.get('APP_NAME')}] Please reset you password`

  constructor(
    private recipients: ForgotPasswordNotificationRecipients,
    private payload: ForgotPasswordNotificationPayload
  ) {
    super()
  }

  private get email() {
    return app.inProduction ? this.recipients.user.email : env.get('MAIL_TO_OVERRIDE_EMAIL')
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const resetLink = `${env.get('UI_URL')}/${env.get('UI_RESET_PASSWORD_ROUTE')}?token=${encodeURIComponent(this.payload.token.value)}`

    const viewState = {
      expiration: this.payload.token.expiration,
      resetLink,
      user: this.recipients.user,
    }

    this.message
      .to(this.email)
      .htmlView('emails/forgot_password_html', viewState)
      .textView('emails/forgot_password_text', viewState)
  }
}
