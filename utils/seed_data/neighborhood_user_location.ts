import { neighborhoodUserLocations } from '#database/seeders/test/neighborhood_user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'

export const getUser = (neighborhoodUserLocationId: number) => {
  const neighborhoodUserLocation = neighborhoodUserLocations[neighborhoodUserLocationId - 1]
  const { email } = users[neighborhoodUserLocation.userId - 1]

  return {
    id: neighborhoodUserLocation.userId,
    email,
  }
}
