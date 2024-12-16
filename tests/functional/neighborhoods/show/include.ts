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
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: ['admins', 'foobar'],
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
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'admins.organizations',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
        return {
          id: admin.id,
          email: admin.email,
          organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
        }
      }),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('success - include admins.*', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'admins.organizations',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
        return {
          id: admin.id,
          email: admin.email,
          organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
        }
      }),
    }

    response.assertStatus(200)
    assert.containsSubset(body, neighborhoodData)
  })
    .tagCrud('@read')
    .tagResource(['@neighborhood', '@organization', '@user'])
    .tagSuccess()

  test('success - include admins', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodId = 1

    const response = await client
      .get(`${route}/${neighborhoodId}`)
      .qs({
        include: 'admins',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId),
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
        include: 'admins.organizations',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodSeedData = neighborhoods[neighborhoodId - 1]

    const neighborhoodData = {
      id: neighborhoodId,
      name: neighborhoodSeedData.name,
      admins: NeighborhoodSeedDataUtil.getAdmins(neighborhoodId).map((admin) => {
        return {
          id: admin.id,
          email: admin.email,
          organizations: UserSeedDataUtil.getOrganizations(admin.id as number),
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
