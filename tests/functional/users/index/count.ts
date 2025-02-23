import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - count string is not an acceptable option: *, neighborhoods, neighborhoodLocations, organizationLocations, organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: 'foobar',
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'count',
          message: 'The selected count is invalid',
          meta: {
            choices: [
              '*',
              'neighborhoods',
              'neighborhoodLocations',
              'organizationLocations',
              'organizations',
            ],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - count array has non-acceptable option: neighborhoods, neighborhoodLocations, organizationLocations, organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: ['neighborhoods', 'foobar'],
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'count.1',
          index: 1,
          message: 'The selected 1 is invalid',
          meta: {
            choices: [
              'neighborhoods',
              'neighborhoodLocations',
              'organizationLocations',
              'organizations',
            ],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('success - count: neighborhoods, neighborhoodLocations, organizationLocations, organizations', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: [
          'neighborhoods',
          'neighborhoodLocations',
          'organizationLocations',
          'organizations',
        ],
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
        neighborhoodsCount: UserSeedDataUtil.getneighborhoodsCount(userId),
        neighborhoodLocationsCount: UserSeedDataUtil.getLocationsCount(userId),
        organizationLocationsCount: UserSeedDataUtil.getOrganizationLocationsCount(userId),
        organizationsCount: UserSeedDataUtil.getOrganizationsCount(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('success - count: *', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: '*',
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
        neighborhoodsCount: UserSeedDataUtil.getneighborhoodsCount(userId),
        neighborhoodLocationsCount: UserSeedDataUtil.getLocationsCount(userId),
        organizationLocationsCount: UserSeedDataUtil.getOrganizationLocationsCount(userId),
        organizationsCount: UserSeedDataUtil.getOrganizationsCount(userId),
      }
    })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()
}
