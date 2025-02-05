import vine from '@vinejs/vine'

const password = vine
  .string()
  .trim()
  .minLength(10)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]{10,}$/)

const regexMessage =
  'The {{ field }} field must have at least one uppercase letter, one lowercase letter, one number and one special character (#?!@$%^&*-)'

export default {
  password,
  regexMessage,
}
