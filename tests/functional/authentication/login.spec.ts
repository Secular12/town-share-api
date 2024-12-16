import User from '#models/user'
import { test } from '@japa/runner'

const route = '/authentication/login'

test.group(`POST:${route}`, () => {
  test('bad request - has: active session', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.post(route).loginAs(user)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Request contains an active session' }],
    })
  })
    .tagCrud('@create')
    .tagResource('@session')
    .tagBadRequest()

  test('unprocessable entity - missing: email, timezone', async ({ client }) => {
    const response = await client.post(route).json({})

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'email',
          message: 'The email field must be defined',
          rule: 'required',
        },
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@create')
    .tagResource('@session')
    .tagUnprocessableEntity()

  test('unprocessable entity - invalid format: email', async ({ client }) => {
    const response = await client.post(route).json({
      email: 'bademail',
      password: 'Secret123!',
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'email',
          message: 'The email field must be a valid email address',
          rule: 'email',
        },
      ],
    })
  })
    .tagCrud('@create')
    .tagResource('@session')
    .tagUnprocessableEntity()

  test('bad request - invalid: email', async ({ client }) => {
    const response = await client.post(route).json({
      email: 'bademail@test.com',
      password: 'Secret123!',
    })

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Invalid user credentials' }],
    })
  })
    .tagCrud('@create')
    .tagResource('@session')
    .tagBadRequest()

  test('bad request - invalid: password', async ({ client }) => {
    const response = await client.post(route).json({
      email: 'admin@test.com',
      password: 'badpassword',
    })

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Invalid user credentials' }],
    })
  })
    .tagCrud('@create')
    .tagResource('@session')
    .tagBadRequest()

  test('success - login', async ({ client }) => {
    const response = await client.post(route).json({
      email: 'admin@test.com',
      password: 'Secret123!',
    })

    response.assertStatus(200)
  })
    .tagCrud('@create')
    .tagResource('@session')
    .tagSuccess()
})
