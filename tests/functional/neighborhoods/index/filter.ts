import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizationLocationUsers } from '#database/seeders/test/organization_location_user_seeder'
import { neighborhoodUserLocations } from '#database/seeders/test/neighborhood_user_location_seeder'
import User from '#models/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - not number: organizationId, userId', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        organizationId: 'a',
        page: 1,
        perPage: 100,
        userId: 'd',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'organizationId',
          message: 'The organizationId field must be a number',
          rule: 'number',
        },
        {
          field: 'userId',
          message: 'The userId field must be a number',
          rule: 'number',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagUnprocessableEntity()

  test('unprocessable entity - under number minimum: organizationId, userId', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        organizationId: 0,
        page: 1,
        perPage: 100,
        userId: 0,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'organizationId',
          message: 'The organizationId field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
        {
          field: 'userId',
          message: 'The userId field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagUnprocessableEntity()

  test('success - filter by organizationId', async ({ assert, client }) => {
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

  test('success - filter by userId', async ({ assert, client }) => {
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
        const hasUserLocationUser = neighborhoodUserLocations.some((userLocation) => {
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
}
