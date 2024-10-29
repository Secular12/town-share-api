import User from '#models/user'
import { test } from '@japa/runner'

test.group('POST:authentication/login', () => {
  test('successful login', async ({ client }) => {
    const response = await client.post('/authentication/login').json({
      email: 'admin@test.com',
      password: 'Secret123!',
    })

    response.assertStatus(200)
  })
    .tagRouteGroup('@authentication')
    .tagSuccess()

  test('bad request with invalid email', async ({ client }) => {
    const response = await client.post('/authentication/login').json({
      email: 'bademail@test.com',
      password: 'Secret123!',
    })

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Invalid user credentials' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagBadRequest()

  test('bad request with invalid password', async ({ client }) => {
    const response = await client.post('/authentication/login').json({
      email: 'admin@test.com',
      password: 'badpassword',
    })

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Invalid user credentials' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagBadRequest()

  test('bad request with active session', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.post('/authentication/login').loginAs(user)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Request contains an active session' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagBadRequest()
})
