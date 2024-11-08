import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import * as TestSeedUtil from '#utils/test_seed'
import { test } from '@japa/runner'

test.group('GET:users/:id', () => {
  test('unauthorized when logged out', async ({ client }) => {
    const response = await client.get('/users/1')

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagResource('@user')
    .tagUnauthorized()

  test('successful basic request', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const response = await client.get('/users/1').loginAs(user)
    const body = response.body()
    const { email } = users[0]
    response.assertStatus(200)
    assert.containsSubset(body, { id: 1, email })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('successful counts', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users/16')
      .qs({
        count: ['locations', 'organizationLocations', 'organizations'],
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[15]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: 16,
      email,
      locationsCount: TestSeedUtil.getUserLocationsCount(16),
      organizationLocationsCount: TestSeedUtil.getUserOrganizationLocationsCount(16),
      organizationsCount: TestSeedUtil.getUserOrganizationsCount(16),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include adminedNeighborhoods', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: 'adminedNeighborhoods',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      adminedNeighborhoods: TestSeedUtil.getUserAdminedNeighborhoods(userId),
    })
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('successful include locations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: 'locations',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      locations: TestSeedUtil.getUserLocations(userId),
    })
  })
    .tagCrud('@read')
    .tagResource(['@userLocation', '@user'])
    .tagSuccess()

  test('successful include locations.neighborhood', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: 'locations.neighborhood',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      locations: TestSeedUtil.getUserLocations(userId).map((userLocation) => {
        return {
          ...userLocation,
          neighborhood: neighborhoods[userLocation.neighborhoodId - 1],
        }
      }),
    })
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include organizationLocations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: 'organizationLocations',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      organizationLocations: TestSeedUtil.getUserOrganizationLocations(userId),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@user'])
    .tagSuccess()

  test('successful include organizationLocations.neighborhood', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: 'organizationLocations.neighborhood',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      organizationLocations: TestSeedUtil.getUserOrganizationLocations(userId).map(
        (organizationLocation) => {
          return {
            ...organizationLocation,
            neighborhood: neighborhoods[organizationLocation.neighborhoodId - 1],
          }
        }
      ),
    })
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organizationLocation', '@user'])
    .tagSuccess()

  test('successful include organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: 'organizations',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      organizations: TestSeedUtil.getUserOrganizations(userId),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@user'])
    .tagSuccess()

  test('successful multiple includes', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: ['locations.neighborhood', 'organizations'],
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      locations: TestSeedUtil.getUserLocations(userId).map((userLocation) => {
        return {
          ...userLocation,
          neighborhood: neighborhoods[userLocation.neighborhoodId - 1],
        }
      }),
      organizations: TestSeedUtil.getUserOrganizations(userId),
    })
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include "*"', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const userId = 16

    const response = await client
      .get(`/users/${userId}`)
      .qs({
        include: '*',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[userId - 1]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: userId,
      email,
      locations: TestSeedUtil.getUserLocations(userId).map((userLocation) => {
        return {
          ...userLocation,
          neighborhood: neighborhoods[userLocation.neighborhoodId - 1],
        }
      }),
      organizationLocations: TestSeedUtil.getUserOrganizationLocations(userId).map(
        (organizationLocation) => {
          return {
            ...organizationLocation,
            neighborhood: neighborhoods[organizationLocation.neighborhoodId - 1],
          }
        }
      ),
      organizations: TestSeedUtil.getUserOrganizations(userId),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@organization', '@userLocation', '@user'])
    .tagSuccess()
})
