import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import { test } from '@japa/runner'
import * as TestSeedUtil from '#utils/test_seed'

test.group('GET:users', () => {
  test('unauthorized when logged out', async ({ client }) => {
    const response = await client.get('/users').qs({
      page: 1,
      perPage: 100,
    })

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnauthorized()

  test('unprocessable entity if missing page', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
      .qs({
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'page',
          message: 'The page field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity if missing perPage', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
      .qs({
        page: 1,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'perPage',
          message: 'The perPage field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity if perPage is larger than 100', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
      .qs({
        page: 1,
        perPage: 101,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'perPage',
          message: 'The perPage field must not be greater than 100',
          meta: {
            max: 100,
          },
          rule: 'max',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('successful basic request', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const response = await client
      .get('/users')
      .qs({
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ email }, userIndex) => ({ id: userIndex + 1, email }))

    response.assertStatus(200)
    assert.equal(body.meta.total, users.length)
    assert.equal(body.meta.perPage, 100)
    assert.equal(body.meta.currentPage, 1)
    assert.equal(body.meta.lastPage, Math.ceil(users.length / 100))
    assert.equal(body.meta.firstPage, 1)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('successful counts', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
        locationsCount: TestSeedUtil.getUserLocationsCount(userId),
        organizationLocationsCount: TestSeedUtil.getUserOrganizationLocationsCount(userId),
        organizationsCount: TestSeedUtil.getUserOrganizationsCount(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include locations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
        locations: TestSeedUtil.getUserLocations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@userLocation', '@user'])
    .tagSuccess()

  test('successful include organizationLocations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
        organizationLocations: TestSeedUtil.getUserOrganizationLocations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@user'])
    .tagSuccess()

  test('successful include organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
        organizations: TestSeedUtil.getUserOrganizations(userId),
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
      .get('/users')
      .qs({
        include: ['locations', 'organizations'],
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
        locations: TestSeedUtil.getUserLocations(userId),
        organizations: TestSeedUtil.getUserOrganizations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful include "*"', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
        locations: TestSeedUtil.getUserLocations(userId),
        organizationLocations: TestSeedUtil.getUserOrganizationLocations(userId),
        organizations: TestSeedUtil.getUserOrganizations(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@organization', '@userLocation', '@user'])
    .tagSuccess()

  test('successful orderBy (only status code test: JS/SQL sort mismatch)', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
      .qs({
        orderBy: { column: 'email', order: 'desc' },
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('successful orderBy multiple (only status code test: JS/SQL sort mismatch)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
    .tagResource('@user')
    .tagSuccess()

  test('successful filter by isApplicationAdmin', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
    .tagResource('@user')
    .tagSuccess()

  test('successful filter by neighborhoodId')
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('successful filter by organizationId')
    .tagCrud('@read')
    .tagResource(['@organization', '@user'])
    .tagSuccess()

  test('successful filter by organizationLocationId')
    .tagCrud('@read')
    .tagResource(['@organizationLocation', '@user'])
    .tagSuccess()

  test('successful search by email', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
    .tagResource('@user')
    .tagSuccess()

  test('successful search by name', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get('/users')
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
    .tagResource('@user')
    .tagSuccess()

  test('successful search by address')
    .tagCrud('@read')
    .tagResource(['@userLocation', '@user'])
    .tagSuccess()
})
