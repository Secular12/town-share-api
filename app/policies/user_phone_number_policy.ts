import User from '#models/user'
import UserPhoneNumber from '#models/user_phone_number'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPhoneNumberPolicy extends TownShareBasePolicy {
  create(authUser: User, userId: number) {
    return authUser.id === userId
  }

  delete(authUser: User, userPhoneNumber: UserPhoneNumber): AuthorizerResponse {
    return userPhoneNumber.userId === authUser.id
  }

  read(_authUser: User, _userPhoneNumber: UserPhoneNumber) {
    return true
  }

  readMany(_authUser: User) {
    return true
  }

  update(authUser: User, userPhoneNumber: UserPhoneNumber) {
    return userPhoneNumber.userId === authUser.id
  }
}
