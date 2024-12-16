import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import * as NeighborhoodSeedDataUtil from '#utils/seed_data/neighborhood'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - count string is not an acceptable option: *, admins, organizationLocations, userLocations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 2

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        count: 'foobar',
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
    const neighborhoodId = 2

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        count: ['admins', 'foobar'],
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
    const neighborhoodId = 2

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        count: ['admins', 'organizationLocations', 'userLocations'],
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      adminsCount: NeighborhoodSeedDataUtil.getAdminsCount(neighborhoodId),
      organizationLocationsCount:
        NeighborhoodSeedDataUtil.getOrganizationLocationsCount(neighborhoodId),
      userLocationsCount: NeighborhoodSeedDataUtil.getUserLocationsCount(neighborhoodId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - count: *', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 2

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        count: '*',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      adminsCount: NeighborhoodSeedDataUtil.getAdminsCount(neighborhoodId),
      organizationLocationsCount:
        NeighborhoodSeedDataUtil.getOrganizationLocationsCount(neighborhoodId),
      userLocationsCount: NeighborhoodSeedDataUtil.getUserLocationsCount(neighborhoodId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()
}
