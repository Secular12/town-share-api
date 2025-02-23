import User from '#models/user'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'

export default class NeighborhoodAdminInvitationPolicy extends BasePolicy {
  @allowGuest()
  acceptOrDeny(
    authUser: User | null,
    neighborhoodAdminInvitation: NeighborhoodAdminInvitation
  ): AuthorizerResponse {
    return (
      (!authUser && !!neighborhoodAdminInvitation.pendingUserId) ||
      (!!authUser && authUser.id === neighborhoodAdminInvitation.userId)
    )
  }

  create(authUser: User, neighborhoodId: number): AuthorizerResponse {
    return (
      authUser.isApplicationAdmin ||
      authUser.adminedNeighborhoods.some(({ id }) => id === neighborhoodId)
    )
  }

  async read(authUser: User, neighborhoodAdminInvitation: NeighborhoodAdminInvitation | number) {
    const invitation =
      typeof neighborhoodAdminInvitation === 'number'
        ? await NeighborhoodAdminInvitation.find(neighborhoodAdminInvitation)
        : neighborhoodAdminInvitation
    return (
      authUser.isApplicationAdmin ||
      authUser.id === invitation?.userId ||
      authUser.adminedNeighborhoods.some(({ id }) => id === invitation?.neighborhoodId)
    )
  }

  readMany(authUser: User, neighborhoodId?: number): AuthorizerResponse {
    return (
      authUser.isApplicationAdmin ||
      (neighborhoodId
        ? authUser.adminedNeighborhoods.some(({ id }) => id === neighborhoodId)
        : false)
    )
  }

  resend(
    authUser: User,
    neighborhoodAdminInvitation: NeighborhoodAdminInvitation
  ): AuthorizerResponse {
    return neighborhoodAdminInvitation.inviterId === authUser.id
  }

  revoke(authUser: User, neighborhoodId: number): AuthorizerResponse {
    return (
      authUser.isApplicationAdmin ||
      authUser.adminedNeighborhoods.some(({ id }) => id === neighborhoodId)
    )
  }
}
