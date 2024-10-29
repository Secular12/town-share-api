import User from '#models/user'
import * as UtilHelpers from '#utils/helpers'
import { test } from '@japa/runner'

test.group('PATCH:authentication/reset-password', () => {
  test('successful reset password', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch('/authentication/reset-password').json({
      password: 'Test-Password-123',
      passwordConfirmation: 'Test-Password-123',
      token: token.value!.release(),
    })

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(200)
  })
    .tagRouteGroup('@authentication')
    .tagSuccess()

  test('bad request with active session', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client
      .patch('/authentication/reset-password')
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
    .tagRouteGroup('@authentication')
    .tagBadRequest()

  test('unprocessable entity if missing password', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const requiredPasswordResponse = await client.patch('/authentication/reset-password').json({
      password: '',
      passwordConfirmation: '',
      token: token.value!.release(),
    })

    requiredPasswordResponse.assertStatus(422)
    requiredPasswordResponse.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if missing password confirmation', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const requiredPasswordConfirmationResponse = await client
      .patch('/authentication/reset-password')
      .json({
        password: 'Test-Password-123',
        passwordConfirmation: '',
        token: token.value!.release(),
      })

    requiredPasswordConfirmationResponse.assertStatus(422)
    requiredPasswordConfirmationResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity with invalid token', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const response = await client.patch('/authentication/reset-password').json({
      password: 'Test-Password-123',
      passwordConfirmation: 'Test-Password-123',
      token: 'invalidtoken',
    })

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(422)
    response.assertBody({
      errors: [{ message: 'The provided token is invalid or expired' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity with expired token', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user, [], { expiresIn: '1 second' })

    const releasedToken = token.value!.release()

    await UtilHelpers.wait('2 seconds')

    const response = await client.patch('/authentication/reset-password').json({
      password: 'Test-Password-123',
      passwordConfirmation: 'Test-Password-123',
      token: releasedToken,
    })

    await User.resetTokens.delete(user, token.identifier)

    response.assertStatus(422)
    response.assertBody({
      errors: [{ message: 'The provided token is invalid or expired' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if password is not at least 10 characters', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const minLengthResponse = await client.patch('/authentication/reset-password').json({
      password: 't',
      passwordConfirmation: 't',
      token: token.value!.release(),
    })

    minLengthResponse.assertStatus(422)
    minLengthResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if password does not have at least one lowercase letter', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const regexLowerCaseResponse = await client.patch('/authentication/reset-password').json({
      password: 'TEST-PASSWORD-123',
      passwordConfirmation: 'TEST-PASSWORD-123',
      token: token.value!.release(),
    })

    regexLowerCaseResponse.assertStatus(422)
    regexLowerCaseResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if password does not at least one uppercase letter', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const regexUpperCaseResponse = await client.patch('/authentication/reset-password').json({
      password: 'test-password-123',
      passwordConfirmation: 'test-password-123',
      token: token.value!.release(),
    })

    regexUpperCaseResponse.assertStatus(422)
    regexUpperCaseResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if password does not have at least one number', async ({ client }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const regexNumberResponse = await client.patch('/authentication/reset-password').json({
      password: 'Test-Password',
      passwordConfirmation: 'Test-Password',
      token: token.value!.release(),
    })

    regexNumberResponse.assertStatus(422)
    regexNumberResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if password does not have at least one special character (#?!@$%^&*-)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const regexSpecialCharacterResponse = await client
      .patch('/authentication/reset-password')
      .json({
        password: 'TestPassword123',
        passwordConfirmation: 'TestPassword123',
        token: token.value!.release(),
      })

    regexSpecialCharacterResponse.assertStatus(422)
    regexSpecialCharacterResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if password has an unaccepted special character (#?!@$%^&*-)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const token = await User.resetTokens.create(user)

    const regexSpecialCharacterResponse = await client
      .patch('/authentication/reset-password')
      .json({
        password: 'Test-Password+123',
        passwordConfirmation: 'Test-Password+123',
        token: token.value!.release(),
      })

    regexSpecialCharacterResponse.assertStatus(422)
    regexSpecialCharacterResponse.assertBody({
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
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()
})
