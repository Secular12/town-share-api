import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizationLocationUsers } from '#database/seeders/test/organization_location_user_seeder'
import { userLocations } from '#database/seeders/test/user_location_seeder'
import User from '#models/user'
import * as AuthorizationTestLib from '#tests/lib/authorization'
import * as PaginationTestLib from '#tests/lib/pagination'
import * as NeighborhoodSeedDataUtil from '#utils/seed_data/neighborhood'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

test.group('GET:neighborhoods', () => {
  const resourceTag = '@neighborhood'
  const route = '/neighborhoods'

  AuthorizationTestLib.missingSession({ resourceTag, route })
  PaginationTestLib.missingPage({ authUserId: 1, resourceTag, route })
  PaginationTestLib.missingPerPage({ authUserId: 1, resourceTag, route })
  PaginationTestLib.perPageMax({ authUserId: 1, resourceTag, route })
  PaginationTestLib.success({
    authUserId: 1,
    resourceData: neighborhoods
      .slice(0, 100)
      .map(({ name }, neighborhoodIndex) => ({ id: neighborhoodIndex + 1, name })),
    resourceTag,
    route,
  })

  test('successful include admins', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'admins',
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = neighborhoods
      .slice(0, 100)
      .map((neighborhoodData, neighborhoodIndex) => {
        const neighborhoodId = neighborhoodIndex + 1

        return {
          id: neighborhoodId,
          name: neighborhoodData.name,
          admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('successful include admins.organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'admins.organizations',
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = neighborhoods
      .slice(0, 100)
      .map((neighborhoodData, neighborhoodIndex) => {
        const neighborhoodId = neighborhoodIndex + 1

        return {
          id: neighborhoodId,
          name: neighborhoodData.name,
          admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
            return {
              id: admin.id,
              email: admin.email,
              organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
            }
          }),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('successful orderBy (only status code test: JS/SQL sort mismatch)', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        orderBy: { column: 'name', order: 'desc' },
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
        'orderBy[0][column]': 'name',
        'orderBy[0][order]': 'desc',
        'orderBy[1][column]': 'createdAt',
        'orderBy[1][order]': 'desc',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@read')
    .tagResource(resourceTag)
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

    const neighborhoodsData = neighborhoods
      .slice(0, 100)
      .map(({ name }, neighborhoodIndex) => ({
        id: neighborhoodIndex + 1,
        name,
      }))
      .filter(({ id: neighborhoodId }) => {
        return organizationLocations.some((organizationLocation) => {
          return (
            organizationLocation.neighborhoodId === neighborhoodId &&
            organizationLocation.organizationId === organizationId
          )
        })
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(response.body().data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@user'])
    .tagSuccess()

  test('successful filter by userId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const userId = 15

    const response = await client
      .get(route)
      .qs({
        userId,
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = neighborhoods
      .slice(0, 100)
      .map(({ name }, neighborhoodIndex) => ({
        id: neighborhoodIndex + 1,
        name,
      }))
      .filter(({ id: neighborhoodId }) => {
        const hasUserLocationUser = userLocations.some((userLocation) => {
          return userLocation.userId === userId && userLocation.neighborhoodId === neighborhoodId
        })

        const hasOrganizationLocationUser = organizationLocations.some(
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

        return hasUserLocationUser || hasOrganizationLocationUser
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(response.body().data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()
})
