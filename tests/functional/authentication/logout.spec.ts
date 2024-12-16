import User from '#models/user'
import { test } from '@japa/runner'

const route = '/authentication/logout'

test.group(`DELETE:${route}`, () => {
  test('unauthorized - missing: session', async ({ client }) => {
    const response = await client.delete(route)

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@delete')
    .tagResource('@session')
    .tagUnauthorized()

  test('success - logout', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.delete(route).loginAs(user)

    response.assertStatus(200)
  })
    .tagCrud('@delete')
    .tagResource('@session')
    .tagSuccess()
})
