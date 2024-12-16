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

    const response = await client
      .get(route)
      .qs({
        include: 'foobar',
        page: 1,
        perPage: 100,
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

    const response = await client
      .get(route)
      .qs({
        include: ['adminedNeighborhoods', 'foobar'],
        page: 1,
        perPage: 100,
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

    const response = await client
      .get(route)
      .qs({
        include: ['locations.neighborhood', 'organizationLocations.neighborhood'],
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users.slice(0, 100).map((userData, userIndex) => {
      const userId = userIndex + 1

      return {
        id: userId,
        email: userData.email,
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
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organizationLocation', '@user', '@userLocation'])
    .tagSuccess()

  test('success - include locations.*, organizationsLocations.*', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: ['locations.*', 'organizationLocations.*'],
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users.slice(0, 100).map((userData, userIndex) => {
      const userId = userIndex + 1

      return {
        id: userId,
        email: userData.email,
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
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organizationLocation', '@user', '@userLocation'])
    .tagSuccess()

  test('success - include adminedNeighborhoods, locations, organizationLocations, organizations', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: ['adminedNeighborhoods', 'locations', 'organizationLocations', 'organizations'],
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users.slice(0, 100).map((userData, userIndex) => {
      const userId = userIndex + 1

      return {
        id: userId,
        email: userData.email,
        adminedNeighborhoods: UserSeedDataUtil.getAdminedNeighborhoods(userId),
        locations: UserSeedDataUtil.getLocations(userId),
        organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId),
        organizations: UserSeedDataUtil.getOrganizations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
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

    const response = await client
      .get(route)
      .qs({
        include: '*',
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users.slice(0, 100).map((userData, userIndex) => {
      const userId = userIndex + 1

      return {
        id: userId,
        email: userData.email,
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
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
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
