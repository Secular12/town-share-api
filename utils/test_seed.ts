import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizationLocationUsers } from '#database/seeders/test/organization_location_user_seeder'
import { organizations } from '#database/seeders/test/organization_seeder'
import { organizationUsers } from '#database/seeders/test/organization_user_seeder'
import { userLocations } from '#database/seeders/test/user_location_seeder'

export const getUserLocations = (userId: number) =>
  userLocations.reduce((locations: Record<string, unknown>[], userLocation, userLocationIndex) => {
    if (userLocation.userId === userId) {
      locations.push({ id: userLocationIndex + 1, ...userLocation })
    }

    return locations
  }, [])

export const getUserLocationsCount = (userId: number) =>
  userLocations.reduce((count: number, userLocation) => {
    return userLocation.userId === userId ? count + 1 : count
  }, 0)

export const getUserOrganizationLocations = (userId: number) =>
  organizationLocations.reduce(
    (locations: Record<string, unknown>[], organizationLocation, organizationLocationIndex) => {
      const organizationLocationId = organizationLocationIndex + 1

      if (
        organizationLocationUsers.some(
          ({ organization_location_id, user_id }) =>
            organization_location_id === organizationLocationId && user_id === userId
        )
      ) {
        locations.push({ id: organizationLocationId, ...organizationLocation })
      }

      return locations
    },
    []
  )

export const getUserOrganizationLocationsCount = (userId: number) =>
  organizationLocationUsers.reduce((count: number, organizationLocationUser) => {
    return organizationLocationUser.user_id === userId ? count + 1 : count
  }, 0)

export const getUserOrganizations = (userId: number) =>
  organizations.reduce((orgs: Record<string, unknown>[], organization, organizationIndex) => {
    const organizationId = organizationIndex + 1

    const matchingOrganizationUser = organizationUsers.find(
      ({ organization_id, user_id }) => organizationId === organization_id && userId === user_id
    )

    if (matchingOrganizationUser) {
      orgs.push({
        id: organizationId,
        isOrganizationAdmin: matchingOrganizationUser.is_organization_admin,
        ...organization,
      })
    }

    return orgs
  }, [])

export const getUserOrganizationsCount = (userId: number) =>
  organizationUsers.reduce((count: number, organizationUser) => {
    return organizationUser.user_id === userId ? count + 1 : count
  }, 0)
