import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import { paginateSeedData } from '#utils/test'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - search is missing: column', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({ page: 1, perPage: 100, search: { value: 'foobar' } })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.column',
          message: 'The column field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search is missing: value', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({ page: 1, perPage: 100, search: { column: 'name' } })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.value',
          message: 'The value field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[] is missing: column', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'name',
        'search[0][value]': 'a',
        'search[1][value]': 'foobar',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.1.column',
          message: 'The column field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[] is missing: value', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'name',
        'search[0][value]': 'a',
        'search[1][column]': 'city',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.1.value',
          message: 'The value field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search.column is not an acceptable options: city, name, state', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({ page: 1, perPage: 100, search: { column: 'foobar', value: 'a' } })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.column',
          message: 'The selected column is invalid',
          meta: {
            choices: ['city', 'name', 'state'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[].column is not an acceptable options: city, name, state', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'name',
        'search[0][value]': 'a',
        'search[1][column]': 'foobar',
        'search[1][value]': 'b',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.1.column',
          message: 'The selected column is invalid',
          meta: {
            choices: ['city', 'name', 'state'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[].column is not distinct', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'name',
        'search[0][value]': 'a',
        'search[1][column]': 'name',
        'search[1][value]': 'b',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search',
          message: 'The search field has duplicate values',
          meta: {
            fields: 'column',
          },
          rule: 'distinct',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search.value string min length: 1', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({ page: 1, perPage: 100, search: { column: 'name', value: '' } })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.value',
          message: 'The value field must have at least 1 characters',
          meta: {
            min: 1,
          },
          rule: 'minLength',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[].value string min length: 1', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'name',
        'search[0][value]': 'a',
        'search[1][column]': 'city',
        'search[1][value]': '',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'search.1.value',
          message: 'The value field must have at least 1 characters',
          meta: {
            min: 1,
          },
          rule: 'minLength',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - search is case insensitive', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 1,
        perPage: 100,
        search: { column: 'name', value: 'north' },
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = paginateSeedData(neighborhoods).filter((neighborhood) => {
      return neighborhood.name.toLowerCase().includes('north')
    })

    response.assertStatus(200)
    assert.lengthOf(body.data, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - search by name, city, state', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'name',
        'search[0][value]': 'Hills',
        'search[1][column]': 'city',
        'search[1][value]': 'Sedona',
        'search[2][column]': 'state',
        'search[2][value]': 'Washington',
      })
      .loginAs(user)

    const body = response.body()

    const neighborhoodsData = paginateSeedData(neighborhoods).filter((neighborhood) => {
      return (
        neighborhood.name.toLowerCase().includes('hills') ||
        neighborhood.city.toLowerCase().includes('sedona') ||
        neighborhood.state.toLowerCase().includes('washington')
      )
    })

    response.assertStatus(200)
    assert.lengthOf(body.data, neighborhoodsData.length)
    assert.containsSubset(body.data, neighborhoodsData)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()
}
