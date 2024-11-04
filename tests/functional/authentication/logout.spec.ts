import User from '#models/user'
import { test } from '@japa/runner'

test.group('DELETE:authentication/logout', () => {
  test('successful logout', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.delete('/authentication/logout').loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@delete')
    .tagResource('@session')
    .tagSuccess()

  test('unauthorized when already logged out', async ({ client }) => {
    const response = await client.delete('/authentication/logout')

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@delete')
    .tagResource('@session')
    .tagUnauthorized()
})
