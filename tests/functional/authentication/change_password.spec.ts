import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'

test.group('PATCH:authentication/change-password', () => {
  test('successful change password', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'Test-Password-123',
        newPasswordConfirmation: 'Test-Password-123',
      })
      .loginAs(user)

    response.assertStatus(200)

    await user.refresh()

    const isNewPasswordChanged = await hash.verify(user.password, 'Test-Password-123')

    assert.isTrue(isNewPasswordChanged)

    user.password = 'Secret123!'

    await user.save()
  })
    .tagRouteGroup('@authentication')
    .tagSuccess()

  test('unauthorized when logged out', async ({ client }) => {
    const response = await client.patch('/authentication/change-password').json({
      currentPassword: 'Secret123!',
      newPassword: 'Test-Password-123',
      newPasswordConfirmation: 'Test-Password-123',
    })

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnauthorized()

  test('bad request with invalid current password', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'badpassword',
        newPassword: 'Test-Password-123',
        newPasswordConfirmation: 'Test-Password-123',
      })
      .loginAs(user)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Invalid user credentials' }],
    })
  })
    .tagRouteGroup('@authentication')
    .tagBadRequest()

  test('unprocessable entity if missing current password', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: '',
        newPassword: 'Test-Password-123',
        newPasswordConfirmation: 'Test-Password-123',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'currentPassword',
          message: 'The currentPassword field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if missing new password', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: '',
        newPasswordConfirmation: 'Test-Password-123',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message: 'The newPassword field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if missing new password confirmation', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'Test-Password-123',
        newPasswordConfirmation: '',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message: 'The newPassword field and newPasswordConfirmation field must be the same',
          meta: { otherField: 'newPasswordConfirmation' },
          rule: 'confirmed',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if new password is not at least 10 characters', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'Secret1!',
        newPasswordConfirmation: 'Secret1!',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message: 'The newPassword field must have at least 10 characters',
          meta: { min: 10 },
          rule: 'minLength',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if new password does not have at least one lowercase letter', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'TEST-PASSWORD-123',
        newPasswordConfirmation: 'TEST-PASSWORD-123',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message:
            'The newPassword field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if new password does not at least one uppercase letter', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'test-password-123',
        newPasswordConfirmation: 'test-password-123',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message:
            'The newPassword field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if new password does not have at least one number', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'Test-Password',
        newPasswordConfirmation: 'Test-Password',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message:
            'The newPassword field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if new password does not have at least one special character (#?!@$%^&*-)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'TestPassword123',
        newPasswordConfirmation: 'TestPassword123',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message:
            'The newPassword field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()

  test('unprocessable entity if new password has an unaccepted special character (#?!@$%^&*-)', async ({
    client,
  }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('/authentication/change-password')
      .json({
        currentPassword: 'Secret123!',
        newPassword: 'Test-Password+123',
        newPasswordConfirmation: 'Test-Password+123',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'newPassword',
          message:
            'The newPassword field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)',
          rule: 'regex',
        },
      ],
    })
  })
    .tagRouteGroup('@authentication')
    .tagUnprocessableEntity()
})
