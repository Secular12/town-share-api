import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - count string is not an acceptable option: *, neighborhoods, neighborhoodLocations, organizationLocations, organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client.get(`${route}/${userId}`).qs({ count: 'foobar' }).loginAs(user)

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
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        count: ['neighborhoods', 'foobar'],
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
    const userId = 9

    const response = await client
      .get(`${route}/${userId}`)
      .qs({
        count: [
          'neighborhoods',
          'neighborhoodLocations',
          'organizationLocations',
          'organizations',
        ],
      })
      .loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      neighborhoodsCount: UserSeedDataUtil.getneighborhoodsCount(userId),
      neighborhoodLocationsCount: UserSeedDataUtil.getLocationsCount(userId),
      organizationLocationsCount: UserSeedDataUtil.getOrganizationLocationsCount(userId),
      organizationsCount: UserSeedDataUtil.getOrganizationsCount(userId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, userData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('success - count: *', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const userId = 9

    const response = await client.get(`${route}/${userId}`).qs({ count: '*' }).loginAs(user)

    const body = response.body()

    const userSeedData = users[userId - 1]

    const userData = {
      id: userId,
      email: userSeedData.email,
      neighborhoodsCount: UserSeedDataUtil.getneighborhoodsCount(userId),
      neighborhoodLocationsCount: UserSeedDataUtil.getLocationsCount(userId),
      organizationLocationsCount: UserSeedDataUtil.getOrganizationLocationsCount(userId),
      organizationsCount: UserSeedDataUtil.getOrganizationsCount(userId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, userData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()
}
