import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import * as NeighborhoodSeedDataUtil from '#utils/seed_data/neighborhood'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - count string is not an acceptable option: *, admins, organizationLocations, userLocations', async ({
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
            choices: ['*', 'admins', 'organizationLocations', 'userLocations'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - count array has non-acceptable option: admins, organizationLocations, userLocations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: ['admins', 'foobar'],
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
            choices: ['admins', 'organizationLocations', 'userLocations'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - count: admins, organizationLocations, userLocations', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        count: ['admins', 'organizationLocations', 'userLocations'],
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
          adminsCount: NeighborhoodSeedDataUtil.getAdminsCount(neighborhoodId),
          organizationLocationsCount:
            NeighborhoodSeedDataUtil.getOrganizationLocationsCount(neighborhoodId),
          userLocationsCount: NeighborhoodSeedDataUtil.getUserLocationsCount(neighborhoodId),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
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

    const neighborhoodsData = neighborhoods
      .slice(0, 100)
      .map((neighborhoodData, neighborhoodIndex) => {
        const neighborhoodId = neighborhoodIndex + 1

        return {
          id: neighborhoodId,
          name: neighborhoodData.name,
          adminsCount: NeighborhoodSeedDataUtil.getAdminsCount(neighborhoodId),
          organizationLocationsCount:
            NeighborhoodSeedDataUtil.getOrganizationLocationsCount(neighborhoodId),
          userLocationsCount: NeighborhoodSeedDataUtil.getUserLocationsCount(neighborhoodId),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()
}
