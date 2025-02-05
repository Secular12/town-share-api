import User from '#models/user'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends TownShareBasePolicy {
  create(_authUser: User): AuthorizerResponse {
    return false
  }

  deactivate(_authUser: User): AuthorizerResponse {
    return false
  }

  demoteAdmin(_authUser: User): AuthorizerResponse {
    return false
  }

  edit(authUser: User, user: User | number): AuthorizerResponse {
    return authUser.id === (typeof user === 'number' ? user : user.id)
  }

  read(_authUser: User): AuthorizerResponse {
    return true
  }

  readMany(_authUser: User): AuthorizerResponse {
    return true
  }
}
