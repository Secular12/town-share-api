import User from '#models/user'
import HelpersUtil from '#utils/helpers'
import { test } from '@japa/runner'

const route = '/authentication/reset-password'

test.group(`PATCH:${route}`, () => {
  test('bad request - has: active session', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client
      .patch(route)
      .json({
        password: 'Test-Password-123',
        passwordConfirmation: 'Test-Password-123',
        token: token.value!.release(),
      })
      .loginAs(user)

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Request contains an active session' }],
    })
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagBadRequest()

  test('unprocessable entity - missing: password, token', async ({ client }) => {
    const response = await client.patch(route).json({})

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
        {
          field: 'token',
          message: 'The token field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - missing: password confirmation', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'Test-Password-123',
      passwordConfirmation: '',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field and passwordConfirmation field must be the same',
          meta: { otherField: 'passwordConfirmation' },
          rule: 'confirmed',
        },
      ],
    })
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - password is not at least 10 characters', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'Secret1!',
      passwordConfirmation: 'Secret1!',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field must have at least 10 characters',
          meta: { min: 10 },
          rule: 'minLength',
        },
      ],
    })

    await User.resetTokens.delete(user, token.identifier)
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - password does not have at least one lowercase letter', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'TEST-PASSWORD-123',
      passwordConfirmation: 'TEST-PASSWORD-123',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message:
            'The password field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })

    await User.resetTokens.delete(user, token.identifier)
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - password does not at least one uppercase letter', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'test-password-123',
      passwordConfirmation: 'test-password-123',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message:
            'The password field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })

    await User.resetTokens.delete(user, token.identifier)
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - password does not have at least one number', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'Test-Password',
      passwordConfirmation: 'Test-Password',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message:
            'The password field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })

    await User.resetTokens.delete(user, token.identifier)
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - password does not have at least one special character (#?!@$%^&*-)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'TestPassword123',
      passwordConfirmation: 'TestPassword123',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message:
            'The password field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })

    await User.resetTokens.delete(user, token.identifier)
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('unprocessable entity - password has an unaccepted special character (#?!@$%^&*-)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'Test-Password+123',
      passwordConfirmation: 'Test-Password+123',
      token: token.value!.release(),
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message:
            'The password field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })

    await User.resetTokens.delete(user, token.identifier)
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagUnprocessableEntity()

  test('bad request - invalid: token', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'Test-Password-123',
      passwordConfirmation: 'Test-Password-123',
      token: 'invalidtoken',
    })

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'The provided token is invalid or expired' }],
    })
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagBadRequest()

  test('bad request - expired: token', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user, [], { expiresIn: '1 second' })

    const releasedToken = token.value!.release()

    await HelpersUtil.wait('2 seconds')

    const response = await client.patch(route).json({
      password: 'Test-Password-123',
      passwordConfirmation: 'Test-Password-123',
      token: releasedToken,
    })

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'The provided token is invalid or expired' }],
    })
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagBadRequest()

  test('success - reset password', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch(route).json({
      password: 'Test-Password-123',
      passwordConfirmation: 'Test-Password-123',
      token: token.value!.release(),
    })

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(200)

    user.password = 'Secret123!'

    await user.save()
  })
    .tagCrud('@update')
    .tagResource(['@user', '@userToken'])
    .tagSuccess()
})
