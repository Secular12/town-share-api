import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const passwordRegexMessage =
  'The {{ field }} field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)'

const passwordSchema = vine
  .string()
  .trim()
  .minLength(10)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]{10,}$/)

export const changePassword = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    newPassword: passwordSchema.clone().confirmed({ confirmationField: 'newPasswordConfirmation' }),
  })
)

changePassword.messagesProvider = new SimpleMessagesProvider({
  'newPassword.regex': passwordRegexMessage,
})

export const forgotPassword = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    timezone: vine.string().timezone(),
  })
)

export const login = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

export const resetPassword = vine.compile(
  vine.object({
    password: passwordSchema.clone().confirmed({ confirmationField: 'passwordConfirmation' }),
    token: vine.string().trim(),
  })
)

resetPassword.messagesProvider = new SimpleMessagesProvider({
  'password.regex': passwordRegexMessage,
})
