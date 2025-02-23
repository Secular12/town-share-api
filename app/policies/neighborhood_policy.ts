import User from '#models/user'
import Neighborhood from '#models/neighborhood'
import TownShareBasePolicy from '#policies/town_share_base_policy'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class NeighborhoodPolicy extends TownShareBasePolicy {
  create(_authUser: User): AuthorizerResponse {
    return false
  }

  edit(authUser: User, neighborhood: Neighborhood | number) {
    const adminedNeighborhoodIds = authUser.neighborhoods.map(({ id }) => id)

    return adminedNeighborhoodIds.includes(
      typeof neighborhood === 'number' ? neighborhood : neighborhood.id
    )
  }

  read(_authUser: User, _neighborhood: Neighborhood | number): AuthorizerResponse {
    return true
  }

  readMany(_authUser: User): AuthorizerResponse {
    return true
  }
}
