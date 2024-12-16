import { users } from '#database/seeders/test/user_seeder'
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search is missing: value', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({ page: 1, perPage: 100, search: { column: 'email' } })
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[] is missing: column', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'email',
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[] is missing: value', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'email',
        'search[0][value]': 'a',
        'search[1][column]': 'firstName',
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search.column is not an acceptable options: email, firstName, fullName, lastName, middleName, name, nameSuffix', async ({
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
            choices: [
              'email',
              'firstName',
              'fullName',
              'lastName',
              'middleName',
              'name',
              'nameSuffix',
            ],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[].column is not an acceptable options: email, firstName, fullName, lastName, middleName, name, nameSuffix', async ({
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
            choices: [
              'email',
              'firstName',
              'fullName',
              'lastName',
              'middleName',
              'name',
              'nameSuffix',
            ],
          },
          rule: 'enum',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[].column is not distinct', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'email',
        'search[0][value]': 'a',
        'search[1][column]': 'email',
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search.value string min length: 1', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({ page: 1, perPage: 100, search: { column: 'email', value: '' } })
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - search[].value string min length: 1', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'email',
        'search[0][value]': 'a',
        'search[1][column]': 'firstName',
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
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('success - search is case insensitive', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        page: 1,
        perPage: 100,
        search: { column: 'email', value: 'ADMIN' },
      })
      .loginAs(user)

    const body = response.body()

    const usersData = paginateSeedData(users)
      .filter((userData) => {
        return userData.email.toLowerCase().includes('admin')
      })
      .map(({ id, email }) => ({ id, email }))

    response.assertStatus(200)
    assert.lengthOf(body.data, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()

  test('success - search by email, firstName, fullName, lastName, middleName, name, nameSuffix', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .get(route)
      .qs({
        'page': 1,
        'perPage': 100,
        'search[0][column]': 'email',
        'search[0][value]': 'admin',
        'search[1][column]': 'firstName',
        'search[1][value]': 'john',
        'search[2][column]': 'fullName',
        'search[2][value]': 'anne',
        'search[3][column]': 'lastName',
        'search[3][value]': 'Doe',
        'search[4][column]': 'middleName',
        'search[4][value]': 'test',
        'search[5][column]': 'name',
        'search[5][value]': 'jones esq',
        'search[6][column]': 'nameSuffix',
        'search[6][value]': 'III',
      })
      .loginAs(user)

    const body = response.body()

    const usersData = paginateSeedData(users)
      .filter((userData) => {
        const name = [userData.firstName, userData.lastName, userData.nameSuffix]
          .filter((namePart) => !!namePart)
          .join(' ')
        const fullName = [
          userData.firstName,
          userData.middleName,
          userData.lastName,
          userData.nameSuffix,
        ]
          .filter((namePart) => !!namePart)
          .join(' ')
        return (
          userData.email.toLowerCase().includes('admin') ||
          userData.firstName.toLowerCase().includes('john') ||
          fullName.toLowerCase().includes('anne') ||
          userData.lastName.toLowerCase().includes('doe') ||
          userData.middleName?.toLowerCase()?.includes('test') ||
          name.toLowerCase().includes('jones esq') ||
          userData.nameSuffix?.toLowerCase()?.includes('iii')
        )
      })
      .map(({ id, email }) => ({ id, email }))

    response.assertStatus(200)
    assert.lengthOf(body.data, usersData.length)
    assert.containsSubset(body.data, usersData)
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()
}
