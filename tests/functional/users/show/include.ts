import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - include string is not an acceptable option: *, neighborhoods, neighborhoodLocations, neighborhoodLocations.*, neighborhoodLocations.neighborhood, organizationLocations, organizationLocations.*, organizationLocations.neighborhood, organizations', async ({
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
              'neighborhoods',
              'neighborhoodLocations',
              'neighborhoodLocations.*',
              'neighborhoodLocations.neighborhood',
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

  test('unprocessable entity - include array has non-acceptable option: users, users.*, users.organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: ['neighborhoods', 'foobar'],
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
              'neighborhoods',
              'neighborhoodLocations',
              'neighborhoodLocations.*',
              'neighborhoodLocations.neighborhood',
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

  test('success - include: neighborhoodLocations.neighborhood, organizationLocations.neighborhood', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: ['neighborhoodLocations.neighborhood', 'organizationLocations.neighborhood'],
      })
      .loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      neighborhoodLocations: UserSeedDataUtil.getLocations(userId).map((neighborhoodLocation) => {
        return {
          id: neighborhoodLocation.id,
          city: neighborhoodLocation.city,
          state: neighborhoodLocation.state,
          neighborhood: neighborhoods[neighborhoodLocation.neighborhoodId - 1],
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
    .tagResource(['@neighborhood', '@organizationLocation', '@user', '@neighborhoodUserLocation'])
    .tagSuccess()

  test('success - include neighborhoodLocations.*, organizationsLocations.*', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: ['neighborhoodLocations.*', 'organizationLocations.*'],
      })
      .loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      neighborhoodLocations: UserSeedDataUtil.getLocations(userId).map((neighborhoodLocation) => {
        return {
          id: neighborhoodLocation.id,
          city: neighborhoodLocation.city,
          state: neighborhoodLocation.state,
          neighborhood: neighborhoods[neighborhoodLocation.neighborhoodId - 1],
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
    .tagResource(['@neighborhood', '@organizationLocation', '@user', '@neighborhoodUserLocation'])
    .tagSuccess()

  test('success - include neighborhoods, neighborhoodLocations, organizationLocations, organizations, sponsor, sponsoredUsers', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        include: [
          'neighborhoods',
          'neighborhoodLocations',
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
      neighborhoods: UserSeedDataUtil.getneighborhoods(userId),
      neighborhoodLocations: UserSeedDataUtil.getLocations(userId),
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
      '@neighborhoodUserLocation',
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
      neighborhoods: UserSeedDataUtil.getneighborhoods(userId),
      neighborhoodLocations: UserSeedDataUtil.getLocations(userId).map((neighborhoodLocation) => {
        return {
          id: neighborhoodLocation.id,
          city: neighborhoodLocation.city,
          state: neighborhoodLocation.state,
          neighborhood: neighborhoods[neighborhoodLocation.neighborhoodId - 1],
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
      '@neighborhoodUserLocation',
    ])
    .tagSuccess()
}
