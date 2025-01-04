import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - include string is not an acceptable option: *, adminedNeighborhoods, locations, locations.*, locations.neighborhood, organizationLocations, organizationLocations.*, organizationLocations.neighborhood, organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: 'foobar',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'include',
          message: 'The selected include is invalid',
          meta: {
            choices: [
              '*',
              'adminedNeighborhoods',
              'locations',
              'locations.*',
              'locations.neighborhood',
              'organizationLocations',
              'organizationLocations.*',
              'organizationLocations.neighborhood',
              'organizations',
              'sponsor',
              'sponsoredUsers',
            ],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - include array has non-acceptable option: admins, admins.*, admins.organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: ['adminedNeighborhoods', 'foobar'],
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'include.1',
          index: 1,
          message: 'The selected 1 is invalid',
          meta: {
            choices: [
              'adminedNeighborhoods',
              'locations',
              'locations.*',
              'locations.neighborhood',
              'organizationLocations',
              'organizationLocations.*',
              'organizationLocations.neighborhood',
              'organizations',
              'sponsor',
              'sponsoredUsers',
            ],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - include: locations.neighborhood, organizationLocations.neighborhood', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: ['locations.neighborhood', 'organizationLocations.neighborhood'],
      })
      .loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      locations: UserSeedDataUtil.getLocations(userId).map((location) => {
        return {
          id: location.id,
          city: location.city,
          state: location.state,
          neighborhood: neighborhoods[location.neighborhoodId - 1],
        }
      }),
      organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId).map(
        (organizationLocation) => {
          return {
            id: organizationLocation.id,
            city: organizationLocation.city,
            state: organizationLocation.state,
            neighborhood: neighborhoods[organizationLocation.neighborhoodId - 1],
          }
        }
      ),
    }

    response.assertStatus(200)
    assert.containsSubset(body, userData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organizationLocation', '@user', '@userLocation'])
    .tagSuccess()

  test('success - include locations.*, organizationsLocations.*', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: ['locations.*', 'organizationLocations.*'],
      })
      .loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      locations: UserSeedDataUtil.getLocations(userId).map((location) => {
        return {
          id: location.id,
          city: location.city,
          state: location.state,
          neighborhood: neighborhoods[location.neighborhoodId - 1],
        }
      }),
      organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId).map(
        (organizationLocation) => {
          return {
            id: organizationLocation.id,
            city: organizationLocation.city,
            state: organizationLocation.state,
            neighborhood: neighborhoods[organizationLocation.neighborhoodId - 1],
          }
        }
      ),
    }

    response.assertStatus(200)
    assert.containsSubset(body, userData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organizationLocation', '@user', '@userLocation'])
    .tagSuccess()

  test('success - include adminedNeighborhoods, locations, organizationLocations, organizations, sponsor, sponsoredUsers', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: [
          'adminedNeighborhoods',
          'locations',
          'organizationLocations',
          'organizations',
          'sponsor',
          'sponsoredUsers',
        ],
      })
      .loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      adminedNeighborhoods: UserSeedDataUtil.getAdminedNeighborhoods(userId),
      locations: UserSeedDataUtil.getLocations(userId),
      organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId),
      organizations: UserSeedDataUtil.getOrganizations(userId),
      sponsor: UserSeedDataUtil.getSponsor(userId),
      sponsoredUsers: UserSeedDataUtil.getSponsoredUsers(userId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, userData)
  })
    .tagCrud('@read')
    .tagResource([
      '@neighborhood',
      '@organization',
      '@organizationLocation',
      '@user',
      '@userLocation',
    ])
    .tagSuccess()

  test('success - include: *', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client.get(`${route}/${userId}`).qs({ include: '*' }).loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      adminedNeighborhoods: UserSeedDataUtil.getAdminedNeighborhoods(userId),
      locations: UserSeedDataUtil.getLocations(userId).map((location) => {
        return {
          id: location.id,
          city: location.city,
          state: location.state,
          neighborhood: neighborhoods[location.neighborhoodId - 1],
        }
      }),
      organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId).map(
        (organizationLocation) => {
          return {
            id: organizationLocation.id,
            city: organizationLocation.city,
            state: organizationLocation.state,
            neighborhood: neighborhoods[organizationLocation.neighborhoodId - 1],
          }
        }
      ),
      organizations: UserSeedDataUtil.getOrganizations(userId),
      sponsor: UserSeedDataUtil.getSponsor(userId),
      sponsoredUsers: UserSeedDataUtil.getSponsoredUsers(userId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, userData)
  })
    .tagCrud('@read')
    .tagResource([
      '@neighborhood',
      '@organization',
      '@organizationLocation',
      '@user',
      '@userLocation',
    ])
    .tagSuccess()
}
