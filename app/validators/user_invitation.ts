import vine from '@vinejs/vine'

const send = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export default {
  send,
}
