import vine from '@vinejs/vine'

const passwordSchema = vine
  .string()
  .trim()
  .minLength(10)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]{10,}$/)

export const passwordRegexMessage =
  'The {{ field }} field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)'

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
