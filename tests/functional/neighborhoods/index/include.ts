import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import * as NeighborhoodSeedDataUtil from '#utils/seed_data/neighborhood'
import * as UserSeedDataUtil from '#utils/seed_data/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - include string is not an acceptable option: *, admins, admins.*, admins.organizations', async ({
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
            choices: ['*', 'admins', 'admins.*', 'admins.organizations'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - include array has non-acceptable option: admins, admins.*, admins.organizations', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: ['admins', 'foobar'],
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
            choices: ['admins', 'admins.*', 'admins.organizations'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - include: admins.organizations', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'admins.organizations',
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
          admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
            return {
              id: admin.id,
              email: admin.email,
              organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
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

  test('success - include admins.*', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'admins.organizations',
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
          admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
            return {
              id: admin.id,
              email: admin.email,
              organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
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

  test('success - include admins', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        include: 'admins',
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
          admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId),
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
        include: 'admins.organizations',
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
          admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
            return {
              id: admin.id,
              email: admin.email,
              organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
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
