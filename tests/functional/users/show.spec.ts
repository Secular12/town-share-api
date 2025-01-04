import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import UsersShowCountTests from '#tests/functional/users/show/count'
import UsersShowIncludeTests from '#tests/functional/users/show/include'
import { test } from '@japa/runner'

const route = '/users'

test.group('GET:users/:id', () => {
  test('unauthorized - missing session', async ({ client }) => {
    const response = await client.get(`${route}/1`)

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnauthorized()

  UsersShowCountTests(route)
  UsersShowIncludeTests(route)

  test('success - basic request', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const response = await client.get(`${route}/1`).loginAs(user)
    const body = response.body()
    const { email } = users[0]
    response.assertStatus(200)
    assert.containsSubset(body, { id: 1, email })
    assert.onlyProperties(body, [
      'id',
      'sponsorId',
      'email',
      'firstName',
      'middleName',
      'isApplicationAdmin',
      'lastName',
      'nameSuffix',
      'createdAt',
      'updatedAt',
    ])
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagSuccess()
})
