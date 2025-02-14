import { neighborhoodAdmins } from '#database/seeders/test/neighborhood_admin_seeder'
import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizationLocationUsers } from '#database/seeders/test/organization_location_user_seeder'
import { organizations } from '#database/seeders/test/organization_seeder'
import { organizationUsers } from '#database/seeders/test/organization_user_seeder'
import { neighborhoodUserLocations } from '#database/seeders/test/neighborhood_user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'

export const getAdminedNeighborhoods = (userId: number) =>
  neighborhoods.reduce(
    (adminedNeighborhoods: Record<string, unknown>[], neighborhood, neighborhoodIndex) => {
      const neighborhoodId = neighborhoodIndex + 1

      if (
        neighborhoodAdmins.some(
          ({ neighborhood_id, admin_id }) =>
            neighborhood_id === neighborhoodId && admin_id === userId
        )
      ) {
        adminedNeighborhoods.push({ id: neighborhoodId, name: neighborhood.name })
      }

      return adminedNeighborhoods
    },
    []
  )

export const getAdminedNeighborhoodsCount = (userId: number) =>
  neighborhoods.reduce((adminedNeighborhoodsCount, _neighborhood, neighborhoodIndex) => {
    const neighborhoodId = neighborhoodIndex + 1

    if (
      neighborhoodAdmins.some(
        ({ neighborhood_id, admin_id }) => neighborhood_id === neighborhoodId && admin_id === userId
      )
    ) {
      return adminedNeighborhoodsCount + 1
    }

    return adminedNeighborhoodsCount
  }, 0)

export const getLocations = (userId: number) =>
  neighborhoodUserLocations.reduce(
    (
      neighborhoodLocations: ({ id: number } & (typeof neighborhoodUserLocations)[number])[],
      neighborhoodUserLocation,
      neighborhoodUserLocationIndex
    ) => {
      if (neighborhoodUserLocation.userId === userId) {
        neighborhoodLocations.push({
          id: neighborhoodUserLocationIndex + 1,
          ...neighborhoodUserLocation,
        })
      }

      return neighborhoodLocations
    },
    []
  )

export const getLocationsCount = (userId: number) =>
  neighborhoodUserLocations.reduce((count: number, neighborhoodUserLocation) => {
    return neighborhoodUserLocation.userId === userId ? count + 1 : count
  }, 0)

export const getOrganizationLocations = (userId: number) =>
  organizationLocations.reduce(
    (
      neighborhoodLocations: ({ id: number } & (typeof organizationLocations)[number])[],
      organizationLocation,
      organizationLocationIndex
    ) => {
      const organizationLocationId = organizationLocationIndex + 1

      if (
        organizationLocationUsers.some(
          ({ organization_location_id, user_id }) =>
            organization_location_id === organizationLocationId && user_id === userId
        )
      ) {
        return [...neighborhoodLocations, { id: organizationLocationId, ...organizationLocation }]
      }

      return neighborhoodLocations
    },
    []
  )

export const getOrganizationLocationsCount = (userId: number) =>
  organizationLocationUsers.reduce((count: number, organizationLocationUser) => {
    return organizationLocationUser.user_id === userId ? count + 1 : count
  }, 0)

export const getOrganizations = (userId: number) =>
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

export const getOrganizationsCount = (userId: number) =>
  organizationUsers.reduce((count: number, organizationUser) => {
    return organizationUser.user_id === userId ? count + 1 : count
  }, 0)

export const getSponsor = (userId: number) => {
  const sponsorId = users[userId - 1].sponsorId

  const sponsor = sponsorId ? users[sponsorId - 1] : null

  return sponsor
    ? {
        id: sponsorId,
        email: sponsor.email,
      }
    : null
}

export const getSponsoredUsers = (userId: number) => {
  return users.reduce(
    (sponsoredUsers: Record<string, unknown>[], sponsoredUser, sponsoredUserIndex) => {
      const sponsoredUserId = sponsoredUserIndex + 1

      if (sponsoredUser.sponsorId === userId) {
        sponsoredUsers.push({
          id: sponsoredUserId,
          sponsorId: sponsoredUser.sponsorId,
          email: sponsoredUser.email,
        })
      }

      return sponsoredUsers
    },
    []
  )
}
