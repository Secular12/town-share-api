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

  test('successful include locations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users/16')
      .qs({
        include: 'locations',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[15]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: 16,
      email,
      locations: TestSeedUtil.getUserLocations(16),
    })
  })
    .tagCrud('@read')
    .tagResource(['@userLocation', '@user'])
    .tagSuccess()

  test('successful include organizationLocations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users/16')
      .qs({
        include: 'organizationLocations',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[15]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: 16,
      email,
      organizationLocations: TestSeedUtil.getUserOrganizationLocations(16),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@user'])
    .tagSuccess()

  test('successful include organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users/16')
      .qs({
        include: 'organizations',
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[15]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: 16,
      email,
      organizations: TestSeedUtil.getUserOrganizations(16),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@user'])
    .tagSuccess()

  test('successful multiple includes', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users/16')
      .qs({
        include: ['locations', 'organizations'],
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[15]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: 16,
      email,
      locations: TestSeedUtil.getUserLocations(16),
      organizations: TestSeedUtil.getUserOrganizations(16),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include "*"', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users/16')
      .qs({
        include: ['locations', 'organizationLocations', 'organizations'],
      })
      .loginAs(user)

    const body = response.body()
    const { email } = users[15]
    response.assertStatus(200)

    assert.containsSubset(body, {
      id: 16,
      email,
      locations: TestSeedUtil.getUserLocations(16),
      organizationLocations: TestSeedUtil.getUserOrganizationLocations(16),
      organizations: TestSeedUtil.getUserOrganizations(16),
    })
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@organization', '@userLocation', '@user'])
    .tagSuccess()
})
