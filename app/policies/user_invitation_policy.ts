import User from '#models/user'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserInvitationPolicy extends TownShareBasePolicy {
  send(_authUser: User): AuthorizerResponse {
    return true
  }
}
