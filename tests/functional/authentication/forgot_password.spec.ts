import { from as mailConfigFrom } from '#config/mail'
import ForgotPasswordNotification from '#mails/forgot_password_notification'
import User from '#models/user'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'

const route = '/authentication/forgot-password'

test.group(`POST:${route}`, () => {
  test('bad request - has: active session', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.post(route).json({ email: user.email }).loginAs(user)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Request contains an active session' }],
    })
  })
    .tagCrud('@create')
    .tagResource('@userAccessToken')
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
          field: 'timezone',
          message: 'The timezone field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@create')
    .tagResource('@userAccessToken')
    .tagUnprocessableEntity()

  test('unprocessable entity - invalid formats: email, timezone', async ({ client }) => {
    const response = await client.post(route).json({
      email: 'bademail',
      timezone: 'badtimezone',
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'email',
          message: 'The email field must be a valid email address',
          rule: 'email',
        },
        {
          field: 'timezone',
          message: 'The timezone must be a supported IANA zone',
          rule: 'timezone',
        },
      ],
    })
  })
    .tagCrud('@create')
    .tagResource('@userAccessToken')
    .tagUnprocessableEntity()

  test('success - does not send email when provided non-existing email', async ({
    cleanup,
    client,
  }) => {
    const { mails } = mail.fake()

    const response = await client
      .post(route)
      .json({ email: 'incorrect@test.com', timezone: 'America/New_York' })

    response.assertStatus(200)

    mails.assertNoneSent()

    cleanup(() => {
      mail.restore()
    })
  })
    .tagCrud('@create')
    .tagResource('@userAccessToken')
    .tagSuccess()
    .tagEmail()

  test('success - sends forgot password email', async ({ cleanup, client }) => {
    const { mails } = mail.fake()

    const user = await User.findOrFail(1)

    const response = await client
      .post(route)
      .json({ email: user.email, timezone: 'America/New_York' })

    response.assertStatus(200)

    mails.assertSent(ForgotPasswordNotification, ({ message }) => {
      message.assertTo(env.get('MAIL_TO_OVERRIDE_EMAIL'))
      message.assertFrom(mailConfigFrom.address)

      return true
    })

    cleanup(() => {
      mail.restore()
    })
  })
    .tagCrud('@create')
    .tagResource('@userAccessToken')
    .tagSuccess()
    .tagEmail()

  test('success - forgot password email contains working token')
    .tagCrud('@create')
    .tagResource('@userAccessToken')
    .tagSuccess()
    .tagEmail()
})
