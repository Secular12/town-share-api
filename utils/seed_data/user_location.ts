import { userLocations } from '#database/seeders/test/user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'

export const getUser = (userLocationId: number) => {
  const userLocation = userLocations[userLocationId - 1]
  const { email } = users[userLocation.userId - 1]

  return {
    id: userLocation.userId,
    email,
  }
}
