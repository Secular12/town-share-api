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
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'foobar',
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
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: ['users', 'foobar'],
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
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'users.organizations',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId).map((userItem) => {
        return {
          id: userItem.id,
          email: userItem.email,
          organizations: UserSeedDataUtil.getOrganizations(userItem.id as number),
        }
      }),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('success - include users.*', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'users.organizations',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId).map((userItem) => {
        return {
          id: userItem.id,
          email: userItem.email,
          organizations: UserSeedDataUtil.getOrganizations(userItem.id as number),
        }
      }),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('success - include users', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'users',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@user'])
    .tagSuccess()

  test('success - include: *', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'users.organizations',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      users: NeighborhoodSeedDataUtil.getUsers(neighborhoodId).map((userItem) => {
        return {
          id: userItem.id,
          email: userItem.email,
          organizations: UserSeedDataUtil.getOrganizations(userItem.id as number),
        }
      }),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()
}
