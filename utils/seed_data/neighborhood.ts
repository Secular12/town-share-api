import { neighborhoodUsers } from '#database/seeders/test/neighborhood_user_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { neighborhoodUserLocations } from '#database/seeders/test/neighborhood_user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'
import { JsObject } from '#types/object'

export const getUsers = (neighborhoodId: number) =>
  users.reduce((acc: JsObject[], user, userIndex) => {
    const userId = userIndex + 1
    if (
      neighborhoodUsers.some(
        ({ neighborhood_id, user_id }) => neighborhood_id === neighborhoodId && user_id === userId
      )
    ) {
      acc.push({ id: userId, email: user.email })
    }

    return acc
  }, [])

export const getUsersCount = (neighborhoodId: number) =>
  users.reduce((usersCount: number, _user, userIndex) => {
    const userId = userIndex + 1
    if (
      neighborhoodUsers.some(
        ({ neighborhood_id, user_id }) => neighborhood_id === neighborhoodId && user_id === userId
      )
    ) {
      return usersCount + 1
    }

    return usersCount
  }, 0)

export const getOrganizationLocations = (neighborhoodId: number) =>
  organizationLocations.reduce(
    (
      neighborhoodOrganizationLocations: JsObject[],
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
    (acc: JsObject[], neighborhoodUserLocation, neighborhoodUserLocationIndex) => {
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
