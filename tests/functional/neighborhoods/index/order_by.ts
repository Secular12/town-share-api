import User from '#models/user'
import { test } from '@japa/runner'

export default (route: string) => {
  test('unprocessable entity - orderBy is missing: column', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        orderBy: { order: 'desc' },
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy.column',
          message: 'The column field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - orderBy[] is missing: column', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'orderBy[0][column]': 'id',
        'orderBy[1][order]': 'desc',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy.1.column',
          message: 'The column field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - orderBy.column is not an acceptable option: id, city, country, name, state, zip, createdAt, updatedAt', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        orderBy: { column: 'foobar' },
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy.column',
          message: 'The selected column is invalid',
          meta: {
            choices: ['id', 'city', 'country', 'name', 'state', 'zip', 'createdAt', 'updatedAt'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - orderBy[].column is not an acceptable option: id, city, country, name, state, zip, createdAt, updatedAt', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'orderBy[0][column]': 'id',
        'orderBy[1][column]': 'foobar',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy.1.column',
          message: 'The selected column is invalid',
          meta: {
            choices: ['id', 'city', 'country', 'name', 'state', 'zip', 'createdAt', 'updatedAt'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - orderBy[].column is not distinct', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'orderBy[0][column]': 'id',
        'orderBy[1][column]': 'id',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy',
          message: 'The orderBy field has duplicate values',
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

  test('unprocessable entity - orderBy.order is not an acceptable option: asc, desc', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        orderBy: { column: 'id', order: 'foobar' },
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy.order',
          message: 'The selected order is invalid',
          meta: {
            choices: ['asc', 'desc'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - orderBy[].order is not an acceptable option: asc, desc', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'orderBy[0][column]': 'id',
        'orderBy[1][column]': 'name',
        'orderBy[1][order]': 'foobar',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'orderBy.1.order',
          message: 'The selected order is invalid',
          meta: {
            choices: ['asc', 'desc'],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('success - orderBy (only status code test: JS/SQL sort mismatch)', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        orderBy: { column: 'name', order: 'desc' },
        page: 1,
        perPage: 100,
      })
      .loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - orderBy multiple (only status code test: JS/SQL sort mismatch)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'orderBy[0][column]': 'name',
        'orderBy[0][order]': 'desc',
        'orderBy[1][column]': 'createdAt',
        'orderBy[1][order]': 'desc',
        'page': 1,
        'perPage': 100,
      })
      .loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()
}
