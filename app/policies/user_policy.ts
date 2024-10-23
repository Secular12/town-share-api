import User from '#models/user'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends TownShareBasePolicy {
  create(_authUser: User): AuthorizerResponse {
    return false
  }

  delete(_authUser: User, _user: User): AuthorizerResponse {
    return false
  }

  edit(authUser: User, user: User): AuthorizerResponse {
    return authUser.id === user.id
  }

  read(_authUser: User, _user: User): AuthorizerResponse {
    return true
  }

  readMany(_authUser: User): AuthorizerResponse {
    return true
  }
}
