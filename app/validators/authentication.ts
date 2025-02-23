import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import PasswordValidatorSchema from '#validators/schemas/password'

const changePassword = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: PasswordValidatorSchema.password
      .clone()
      .confirmed({ confirmationField: 'newPasswordConfirmation' }),
  })
)

changePassword.messagesProvider = new SimpleMessagesProvider({
  'newPassword.regex': PasswordValidatorSchema.regexMessage,
})

const forgotPassword = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    timezone: vine.string().trim().timezone(),
  })
)

const login = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

const resetPassword = vine.compile(
  vine.object({
    password: PasswordValidatorSchema.password
      .clone()
      .confirmed({ confirmationField: 'passwordConfirmation' }),
    token: vine.string().trim(),
  })
)

resetPassword.messagesProvider = new SimpleMessagesProvider({
  'password.regex': PasswordValidatorSchema.regexMessage,
})

export default {
  changePassword,
  forgotPassword,
  login,
  resetPassword,
}
