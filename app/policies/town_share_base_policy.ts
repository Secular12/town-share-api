import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class TownShareBasePolicy extends BasePolicy {
  async before(user: User | null) {
    if (user?.isApplicationAdmin) {
      return true
    }
  }
}
