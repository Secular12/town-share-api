import vine from '@vinejs/vine'

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
