import { from as mailConfigFrom } from '#config/mail'
import ForgotPasswordNotification from '#mails/forgot_password_notification'
import User from '#models/user'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'

test.group('POST:authentication/forgot-password', () => {
  test('bad request with active session', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .post('/authentication/forgot-password')
      .json({ email: user.email })
      .loginAs(user)

    response.assertStatus(400)
    response.assertBody({
      errors: [{ message: 'Request contains an active session' }],
    })
  })
    .tagCrud('@create')
    .tagResource('@userToken')
    .tagBadRequest()

  test('invalid user email does not send email', async ({ cleanup, client }) => {
    const { mails } = mail.fake()

    const response = await client
      .post('/authentication/forgot-password')
      .json({ email: 'incorrect@test.com', timezone: 'America/New_York' })

    response.assertStatus(200)

    mails.assertNoneSent()

    cleanup(() => {
      mail.restore()
    })
  })
    .tagCrud('@create')
    .tagResource('@userToken')
    .tagSuccess()
    .tagEmail()

  test('valid user email sends forgot password email', async ({ cleanup, client }) => {
    const { mails } = mail.fake()

    const user = await User.findOrFail(1)

    const response = await client
      .post('/authentication/forgot-password')
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
    .tagResource('@userToken')
    .tagSuccess()
    .tagEmail()

  test('forgot password email contains working token')
    .tagCrud('@create')
    .tagResource('@userToken')
    .tagSuccess()
    .tagEmail()
})
