import { neighborhoodAdmins } from '#database/seeders/test/neighborhood_admin_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { neighborhoodUserLocations } from '#database/seeders/test/neighborhood_user_location_seeder'
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
  neighborhoodUserLocations.reduce(
    (acc: Record<string, unknown>[], neighborhoodUserLocation, neighborhoodUserLocationIndex) => {
      const neighborhoodUserLocationId = neighborhoodUserLocationIndex + 1
      if (neighborhoodUserLocation.neighborhoodId === neighborhoodId) {
        acc.push({
          id: neighborhoodUserLocationId,
          ...neighborhoodUserLocation,
        })
      }

      return acc
    },
    []
  )

export const getUserLocationsCount = (neighborhoodId: number) =>
  neighborhoodUserLocations.reduce(
    (neighborhoodUserLocationsCount: number, neighborhoodUserLocation) => {
      if (neighborhoodUserLocation.neighborhoodId === neighborhoodId) {
        return neighborhoodUserLocationsCount + 1
      }

      return neighborhoodUserLocationsCount
    },
    0
  )
