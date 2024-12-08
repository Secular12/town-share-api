import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizationLocationUsers } from '#database/seeders/test/organization_location_user_seeder'
import { organizationUsers } from '#database/seeders/test/organization_user_seeder'
import { userLocations } from '#database/seeders/test/user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import * as AuthorizationTestLib from '#tests/lib/authorization'
import * as PaginationTestLib from '#tests/lib/pagination'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

test.group('GET:users', () => {
  const resourceTag = '@user'
  const route = '/users'

  AuthorizationTestLib.missingSession({ resourceTag, route })
  PaginationTestLib.missingPage({ authUserId: 1, resourceTag, route })
  PaginationTestLib.missingPerPage({ authUserId: 1, resourceTag, route })
  PaginationTestLib.perPageMax({ authUserId: 1, resourceTag, route })
  PaginationTestLib.success({
    authUserId: 1,
    resourceData: users.slice(0, 100).map(({ email }, userIndex) => ({ id: userIndex + 1, email })),
    resourceTag,
    route,
  })

  test('successful counts', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: ['locations', 'organizationLocations', 'organizations'],
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users.slice(0, 100).map(({ email }, userIndex) => {
      const userId = userIndex + 1

      return {
        id: userId,
        email,
        locationsCount: UserSeedDataUtil.getLocationsCount(userId),
        organizationLocationsCount: UserSeedDataUtil.getOrganizationLocationsCount(userId),
        organizationsCount: UserSeedDataUtil.getOrganizationsCount(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include adminedNeighborhoods', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'adminedNeighborhoods',
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
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('successful include locations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'locations',
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
        locations: UserSeedDataUtil.getLocations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@userLocation', '@user'])
    .tagSuccess()

  test('successful include locations.neighborhood', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'locations.neighborhood',
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
        locations: UserSeedDataUtil.getLocations(userId).map((userLocation) => {
          return {
            ...userLocation,
            neighborhood: neighborhoods[userLocation.neighborhoodId - 1],
          }
        }),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include organizationLocations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'organizationLocations',
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
        organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@user'])
    .tagSuccess()

  test('successful include organizationLocations.neighborhood', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'organizationLocations.neighborhood',
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
        organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId).map(
          (organizationLocation) => {
            return {
              ...organizationLocation,
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
    .tagResource(['@neighborhood', '@organizationLocation', '@user'])
    .tagSuccess()

  test('successful include organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'organizations',
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
        organizations: UserSeedDataUtil.getOrganizations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@user'])
    .tagSuccess()

  test('successful multiple includes', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: ['locations.neighborhood', 'organizations'],
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
        locations: UserSeedDataUtil.getLocations(userId).map((userLocation) => {
          return {
            ...userLocation,
            neighborhood: neighborhoods[userLocation.neighborhoodId - 1],
          }
        }),
        organizations: UserSeedDataUtil.getOrganizations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include "*"', async ({ assert, client }) => {
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
        locations: UserSeedDataUtil.getLocations(userId).map((userLocation) => {
          return {
            ...userLocation,
            neighborhood: neighborhoods[userLocation.neighborhoodId - 1],
          }
        }),
        organizationLocations: UserSeedDataUtil.getOrganizationLocations(userId).map(
          (organizationLocation) => {
            return {
              ...organizationLocation,
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
      '@organizationLocation',
      '@organization',
      '@userLocation',
      '@user',
    ])
    .tagSuccess()

  test('successful orderBy (only status code test: JS/SQL sort mismatch)', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        orderBy: { column: 'email', order: 'desc' },
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@read')
    .tagResource(resourceTag)
    .tagSuccess()

  test('successful orderBy multiple (only status code test: JS/SQL sort mismatch)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'orderBy[0][column]': 'lastName',
        'orderBy[0][order]': 'desc',
        'orderBy[1][column]': 'nameSuffix',
        'orderBy[1][order]': 'desc',
        'orderBy[2][column]': 'firstName',
        'orderBy[2][order]': 'desc',
        'orderBy[3][column]': 'middleName',
        'orderBy[3][order]': 'desc',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@read')
    .tagResource(resourceTag)
    .tagSuccess()

  test('successful filter by isApplicationAdmin', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        isApplicationAdmin: false,
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ email, isApplicationAdmin }, userIndex) => ({
        id: userIndex + 1,
        email,
        isApplicationAdmin,
      }))
      .filter(({ isApplicationAdmin }) => !isApplicationAdmin)

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource(resourceTag)
    .tagSuccess()

  test('successful filter by neighborhoodId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 2

    const response = await client
      .get(route)
      .qs({
        neighborhoodId,
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ email }, userIndex) => ({
        id: userIndex + 1,
        email,
      }))
      .filter(({ id: userId }) => {
        const hasUserLocationNeighborhood = userLocations.some((userLocation) => {
          return userLocation.userId === userId && userLocation.neighborhoodId === neighborhoodId
        })

        const hasOrganizationLocationNeighborhood = organizationLocations.some(
          (organizationLocation, organizationLocationIndex) => {
            const organizationLocationId = organizationLocationIndex + 1

            return (
              organizationLocation.neighborhoodId === neighborhoodId &&
              organizationLocationUsers.some(
                (organizationLocationUser) =>
                  organizationLocationUser.organization_location_id === organizationLocationId &&
                  organizationLocationUser.user_id === userId
              )
            )
          }
        )

        return hasUserLocationNeighborhood || hasOrganizationLocationNeighborhood
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('successful filter by organizationId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const organizationId = 2

    const response = await client
      .get(route)
      .qs({
        organizationId,
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ email }, userIndex) => ({
        id: userIndex + 1,
        email,
      }))
      .filter(({ id: userId }) => {
        return organizationUsers.some((organizationUser) => {
          return (
            organizationUser.organization_id === organizationId &&
            organizationUser.user_id === userId
          )
        })
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@user'])
    .tagSuccess()

  test('successful filter by organizationLocationId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const organizationLocationId = 2

    const response = await client
      .get(route)
      .qs({
        organizationLocationId,
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ email }, userIndex) => ({
        id: userIndex + 1,
        email,
      }))
      .filter(({ id: userId }) => {
        return organizationLocationUsers.some(
          (organizationLocationUser) =>
            organizationLocationUser.organization_location_id === organizationLocationId &&
            organizationLocationUser.user_id === userId
        )
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@user'])
    .tagSuccess()

  test('successful search by email', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        search: 'user_share',
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ email }, userIndex) => ({
        id: userIndex + 1,
        email,
      }))
      .filter(({ email }) => email.includes('user_share'))

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(resourceTag)
    .tagSuccess()

  test('successful search by name', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        search: 'test user',
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map((userData, userIndex) => ({
        id: userIndex + 1,
        email: userData.email,
        name:
          `${userData.firstName}` +
          `${userData.middleName ? ` ${userData.middleName}` : ''} ` +
          `${userData.lastName}` +
          `${userData.nameSuffix ? userData.nameSuffix : ''}`,
      }))
      .filter(({ name }) => name.toLowerCase().includes('test user'))
      .map(({ id, email }) => ({ id, email }))

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource(resourceTag)
    .tagSuccess()

  test('successful search by address')
    .tagCrud('@read')
    .tagResource(['@userLocation', '@user'])
    .tagSuccess()
})
