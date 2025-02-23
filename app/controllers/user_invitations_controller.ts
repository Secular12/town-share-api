import UserInvitationNotification from '#mails/user_invitation_notification'
import User from '#models/user'
import UserInvitationPolicy from '#policies/user_invitation_policy'
import UserInvitationValidator from '#validators/user_invitation'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class UserInvitationsController {
  async store({ auth, bouncer, request }: HttpContext) {
    const payload = await UserInvitationValidator.send.validate(request.body())

    await bouncer.with(UserInvitationPolicy).authorize('send')

    const user = User.findBy({ email: payload.email })

    // TODO: Add to DB and prevent too many invitations in a short period of time. Delete invitatons after User creation

    if (!user) {
      await mail.send(
        new UserInvitationNotification({
          inviter: auth.user!,
          recipients: { to: payload.email },
        })
      )
    }
  }
}
