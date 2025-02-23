import User from '#models/user'
import AdminInvitation from '#models/admin_invitation'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'

export default class AdminInvitationPolicy extends BasePolicy {
  @allowGuest()
  acceptOrDeny(authUser: User | null, adminInvitation: AdminInvitation): AuthorizerResponse {
    return (
      authUser?.isApplicationAdmin ||
      (!authUser && !!adminInvitation.pendingUserId) ||
      (!!authUser && authUser.id === adminInvitation.userId)
    )
  }

  create(authUser: User): AuthorizerResponse {
    return authUser.isApplicationAdmin
  }

  async read(authUser: User, adminInvitation: AdminInvitation | number) {
    const invitation =
      typeof adminInvitation === 'number'
        ? await AdminInvitation.find(adminInvitation)
        : adminInvitation
    return authUser.isApplicationAdmin || authUser.id === invitation?.userId
  }

  readMany(authUser: User): AuthorizerResponse {
    return authUser.isApplicationAdmin
  }

  resend(authUser: User, adminInvitation: AdminInvitation): AuthorizerResponse {
    return adminInvitation.inviterId === authUser.id
  }

  revoke(authUser: User): AuthorizerResponse {
    return authUser.isApplicationAdmin
  }
}
