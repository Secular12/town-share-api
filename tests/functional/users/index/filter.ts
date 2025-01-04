import { organizationLocations } from '#database/seeders/test/organization_location_seeder'
import { organizationLocationUsers } from '#database/seeders/test/organization_location_user_seeder'
import { organizationUsers } from '#database/seeders/test/organization_user_seeder'
import { userLocations } from '#database/seeders/test/user_location_seeder'
import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - not correct type: isApplicationAdmin, neighborhoodId, organizationId, organizationLocationId, sponsorId', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        isApplicationAdmin: 'a',
        neighborhoodId: 'b',
        organizationId: 'c',
        organizationLocationId: 'd',
        sponsorId: 'e',
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'isApplicationAdmin',
          message: 'The value must be a boolean',
          rule: 'boolean',
        },
        {
          field: 'neighborhoodId',
          message: 'The neighborhoodId field must be a number',
          rule: 'number',
        },
        {
          field: 'organizationId',
          message: 'The organizationId field must be a number',
          rule: 'number',
        },
        {
          field: 'organizationLocationId',
          message: 'The organizationLocationId field must be a number',
          rule: 'number',
        },
        {
          field: 'sponsorId',
          message: 'The sponsorId field must be a number',
          rule: 'number',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - under number minimum: neighborhoodId, organizationId, organizationLocationId, sponsorId', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        neighborhoodId: 0,
        organizationId: 0,
        organizationLocationId: 0,
        sponsorId: 0,
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'neighborhoodId',
          message: 'The neighborhoodId field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
        {
          field: 'organizationId',
          message: 'The organizationId field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
        {
          field: 'organizationLocationId',
          message: 'The organizationLocationId field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
        {
          field: 'sponsorId',
          message: 'The sponsorId field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('success - filter by neighborhoodId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 2

    const response = await client
      .get(route)
      .qs({
        neighborhoodId,
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
      .filter(({ id: userId }) => {
        const hasUserLocationNeighborhood = userLocations.some((userLocation) => {
          return userLocation.userId === userId && userLocation.neighborhoodId === neighborhoodId
        })

        const hasOrganizationLocationNeighborhood = organizationLocations.some(
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

        return hasUserLocationNeighborhood || hasOrganizationLocationNeighborhood
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

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

    const usersData = users
      .slice(0, 100)
      .map(({ email }, userIndex) => ({
        id: userIndex + 1,
        email,
      }))
      .filter(({ id: userId }) => {
        return organizationUsers.some((organizationUser) => {
          return (
            organizationUser.organization_id === organizationId &&
            organizationUser.user_id === userId
          )
        })
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('success - filter by organizationLocationId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const organizationLocationId = 2

    const response = await client
      .get(route)
      .qs({
        organizationLocationId,
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
      .filter(({ id: userId }) => {
        return organizationLocationUsers.some(
          (organizationLocationUser) =>
            organizationLocationUser.organization_location_id === organizationLocationId &&
            organizationLocationUser.user_id === userId
        )
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('success - filter by sponsorId', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const sponsorId = 1

    const response = await client
      .get(route)
      .qs({
        sponsorId,
        perPage: 100,
        page: 1,
      })
      .loginAs(user)

    const body = response.body()

    const usersData = users
      .slice(0, 100)
      .map(({ sponsorId: userSponsorId, email }, userIndex) => ({
        id: userIndex + 1,
        sponsorId: userSponsorId,
        email,
      }))
      .filter(({ sponsorId: userSponsorId }) => {
        return sponsorId === userSponsorId
      })

    response.assertStatus(200)
    assert.equal(body.data.length, usersData.length)
    assert.containsSubset(response.body().data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()
}
