import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizations } from '#database/seeders/test/organization_seeder'

export const getOrganization = (organizationLocationId: number) => {
  const organizationLocation = organizationLocations[organizationLocationId - 1]

  return {
    id: organizationLocation.organizationId,
    ...organizations[organizationLocation.organizationId - 1],
  }
}
