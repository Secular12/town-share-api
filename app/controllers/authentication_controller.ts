import ForgotPasswordNotification from '#mails/forgot_password_notification'
import User from '#models/user'
import * as AuthenticionValidator from '#validators/authentication'
import { Secret } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { SimpleMessagesProvider } from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class AuthenticationController {
  async forgotPassword({ request }: HttpContext) {
    const { email, timezone } = await AuthenticionValidator.forgotPassword.validate(request.body())

    const user = await User.query().where('email', email).first()

    if (user) {
      const token = await User.resetTokens.create(user)

      await mail.send(
        new ForgotPasswordNotification(
          { user },
          {
            token: {
              expiration: token.expiresAt
                ? DateTime.fromJSDate(token.expiresAt)
                    .setZone(timezone)
                    .toLocaleString(DateTime.DATETIME_FULL)
                : null,
              value: token.value!.release(),
            },
          }
        )
      )
    }

    return {
      message:
        'If a user exists with the provided email, an email with a reset password link has been sent',
    }
  }

  async login({ auth, request }: HttpContext) {
    const payload = await AuthenticionValidator.login.validate(request.body())

    const user = await User.verifyCredentials(payload.email, payload.password)

    return auth.use('web').login(user)
  }

  async logout({ auth }: HttpContext) {
    return auth.use('web').logout()
  }

  async resetPassword({ request, response }: HttpContext) {
    const { password, token } = await AuthenticionValidator.resetPassword.validate(request.body(), {
      messagesProvider: new SimpleMessagesProvider({
        'password.regex': AuthenticionValidator.passwordRegexMessage,
      }),
    })

    const resetPasswordToken = await User.resetTokens.verify(new Secret(token))

    if (!resetPasswordToken) {
      return response.unprocessableEntity({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    const user = await User.find(resetPasswordToken?.tokenableId)

    if (!user) {
      return response.unprocessableEntity({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    user.password = password

    await user.save()

    await User.resetTokens.delete(user, resetPasswordToken.identifier)
  }
}
