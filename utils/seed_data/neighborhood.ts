import { neighborhoodAdmins } from '#database/seeders/test/neighborhood_admin_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { userLocations } from '#database/seeders/test/user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'

export const getAdmins = (neighborhoodId: number) =>
  users.reduce((admins: Record<string, unknown>[], user, userIndex) => {
    const userId = userIndex + 1
    if (
      neighborhoodAdmins.some(
        ({ neighborhood_id, admin_id }) => neighborhood_id === neighborhoodId && admin_id === userId
      )
    ) {
      admins.push({ id: userId, email: user.email })
    }

    return admins
  }, [])

export const getAdminsCount = (neighborhoodId: number) =>
  users.reduce((adminsCount: number, _user, userIndex) => {
    const userId = userIndex + 1
    if (
      neighborhoodAdmins.some(
        ({ neighborhood_id, admin_id }) => neighborhood_id === neighborhoodId && admin_id === userId
      )
    ) {
      return adminsCount + 1
    }

    return adminsCount
  }, 0)

export const getOrganizationLocations = (neighborhoodId: number) =>
  organizationLocations.reduce(
    (
      neighborhoodOrganizationLocations: Record<string, unknown>[],
      organizationLocation,
      organizationLocationIndex
    ) => {
      const organizationLocationId = organizationLocationIndex + 1

      if (organizationLocation.neighborhoodId === neighborhoodId) {
        neighborhoodOrganizationLocations.push({
          id: organizationLocationId,
          ...organizationLocation,
        })
      }

      return neighborhoodOrganizationLocations
    },
    []
  )

export const getOrganizationLocationsCount = (neighborhoodId: number) =>
  organizationLocations.reduce((organizationLocationsCount: number, organizationLocation) => {
    if (organizationLocation.neighborhoodId === neighborhoodId) {
      return organizationLocationsCount + 1
    }

    return organizationLocationsCount
  }, 0)

export const getUserLocations = (neighborhoodId: number) =>
  userLocations.reduce(
    (neighborhoodUserLocations: Record<string, unknown>[], userLocation, userLocationIndex) => {
      const userLocationId = userLocationIndex + 1
      if (userLocation.neighborhoodId === neighborhoodId) {
        neighborhoodUserLocations.push({
          id: userLocationId,
          ...userLocation,
        })
      }

      return neighborhoodUserLocations
    },
    []
  )

export const getUserLocationsCount = (neighborhoodId: number) =>
  userLocations.reduce((userLocationsCount: number, userLocation) => {
    if (userLocation.neighborhoodId === neighborhoodId) {
      return userLocationsCount + 1
    }

    return userLocationsCount
  }, 0)
