import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import { paginateSeedData } from '#utils/test'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - missing: page, perPage', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.get(route).qs({}).loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'page',
          message: 'The page field must be defined',
          rule: 'required',
        },
        {
          field: 'perPage',
          message: 'The perPage field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - not number: page, perPage', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 'b',
        perPage: 'c',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'page',
          message: 'The page field must be a number',
          rule: 'number',
        },
        {
          field: 'perPage',
          message: 'The perPage field must be a number',
          rule: 'number',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - under number minimum: page, perPage', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 0,
        perPage: 0,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'page',
          message: 'The page field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
        {
          field: 'perPage',
          message: 'The perPage field must be at least 1',
          meta: { min: 1 },
          rule: 'min',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - over number maximum: perPage', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 1,
        perPage: 101,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'perPage',
          message: 'The perPage field must not be greater than 100',
          meta: { max: 100 },
          rule: 'max',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - first page', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 1,
        perPage: 1,
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = paginateSeedData(neighborhoods, {
      page: 1,
      perPage: 1,
    })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - second page', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 2,
        perPage: 1,
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = paginateSeedData(neighborhoods, {
      page: 2,
      perPage: 1,
    })

    response.assertStatus(200)
    assert.equal(body.data.length, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()
}
