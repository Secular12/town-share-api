import User from '#models/user'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PendingUserPolicy extends TownShareBasePolicy {
  async before(user: User | null) {
    if (user?.isApplicationAdmin) {
      return true
    }
  }

  read(_authUser: User): AuthorizerResponse {
    return false
  }

  readMany(_authUser: User | null): AuthorizerResponse {
    return false
  }
}
