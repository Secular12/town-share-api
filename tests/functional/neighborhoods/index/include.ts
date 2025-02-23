import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import * as NeighborhoodSeedDataUtil from '#utils/seed_data/neighborhood'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - include string is not an acceptable option: *, users, users.*, users.organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'foobar',
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'include',
          message: 'The selected include is invalid',
          meta: {
            choices: ['*', 'users', 'users.*', 'users.organizations'],
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

    const response = await client
      .get(route)
      .qs({
        include: ['users', 'foobar'],
        page: 1,
        perPage: 100,
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
            choices: ['users', 'users.*', 'users.organizations'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - include: users.organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'users.organizations',
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
          users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId).map((userItem) => {
            return {
              id: userItem.id,
              email: userItem.email,
              organizations: UserSeedDataUtil.getOrganizations(userItem.id as number),
            }
          }),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('success - include users.*', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'users.organizations',
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
          users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId).map((userItem) => {
            return {
              id: userItem.id,
              email: userItem.email,
              organizations: UserSeedDataUtil.getOrganizations(userItem.id as number),
            }
          }),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('success - include users', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'users',
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
          users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('success - include: *', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'users.organizations',
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
          users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId).map((userItem) => {
            return {
              id: userItem.id,
              email: userItem.email,
              organizations: UserSeedDataUtil.getOrganizations(userItem.id as number),
            }
          }),
        }
      })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()
}
