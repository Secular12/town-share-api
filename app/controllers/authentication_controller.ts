import ForgotPasswordNotification from '#mails/forgot_password_notification'
import User from '#models/user'
import AuthenticationValidator from '#validators/authentication'
import { Secret } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class AuthenticationController {
  async changePassword({ auth, request, response }: HttpContext) {
    const payload = await AuthenticationValidator.changePassword.validate(request.body())

    const user = await User.verifyCredentials(auth.user!.email, payload.currentPassword)

    if (!user.isActive) {
      return response.unauthorized({
        message: 'This user has been deactivated.',
      })
    }

    user.password = payload.newPassword

    await user.save()
  }

  async forgotPassword({ request }: HttpContext) {
    const { email, resetLinkUrl, timezone } = await AuthenticationValidator.forgotPassword.validate(
      request.body()
    )

    const user = await User.query()
      .where('email', email)
      .withScopes((scopes) => scopes.isActive())
      .first()

    if (user) {
      const token = await User.resetTokens.create(user)

      await mail.send(
        new ForgotPasswordNotification({
          recipients: { user },
          resetLinkUrl,
          token: {
            expiration: token.expiresAt
              ? DateTime.fromJSDate(token.expiresAt)
                  .setZone(timezone)
                  .toLocaleString(DateTime.DATETIME_FULL)
              : null,
            value: token.value!.release(),
          },
        })
      )
    }

    return {
      message:
        'If a user exists with the provided email, and is active, an email with a reset password link has been sent',
    }
  }

  async login({ auth, request, response }: HttpContext) {
    const payload = await AuthenticationValidator.login.validate(request.body())

    const user = await User.verifyCredentials(payload.email, payload.password)

    if (!user.isActive) {
      return response.unauthorized({
        message: 'This user has been deactivated.',
      })
    }

    return auth.use('web').login(user)
  }

  async logout({ auth }: HttpContext) {
    return auth.use('web').logout()
  }

  async resetPassword({ request, response }: HttpContext) {
    const { password, token } = await AuthenticationValidator.resetPassword.validate(request.body())

    const resetPasswordToken = await User.resetTokens.verify(new Secret(token))

    if (!resetPasswordToken) {
      return response.badRequest({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    const user = await User.find(resetPasswordToken.tokenableId)

    if (!user) {
      return response.badRequest({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    if (!user.isActive) {
      return response.unauthorized({
        message: 'This user has been deactivated.',
      })
    }

    user.password = password

    await user.save()

    await User.resetTokens.delete(user, resetPasswordToken.identifier)
  }
}
