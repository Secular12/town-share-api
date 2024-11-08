import User from '#models/user'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import * as UserValidator from '#validators/user'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends TownShareBasePolicy {
  create(_authUser: User): AuthorizerResponse {
    return false
  }

  edit(authUser: User, user: User | number): AuthorizerResponse {
    return authUser.id === (typeof user === 'number' ? user : user.id)
  }

  editIsApplicationAdmin(
    authUser: User,
    payload: Awaited<ReturnType<typeof UserValidator.update.validate>>
  ): AuthorizerResponse {
    if (payload.isApplicationAdmin !== undefined) {
      return authUser.isApplicationAdmin
    }

    return true
  }

  read(_authUser: User, _user: User | number): AuthorizerResponse {
    return true
  }

  readMany(_authUser: User): AuthorizerResponse {
    return true
  }
}
