import vine from '@vinejs/vine'

const create = vine.object({
  countryCode: vine.string().trim().numeric({ decimal: false, negative: false }).optional(),
  extension: vine.string().trim().numeric({ decimal: false, negative: false }).optional(),
  phone: vine.string().trim().numeric({ decimal: false, negative: false }),
})

const update = vine.object({
  countryCode: vine.string().trim().numeric({ decimal: false, negative: false }).optional(),
  extension: vine.string().trim().numeric({ decimal: false, negative: false }).optional(),
  phone: vine.string().trim().numeric({ decimal: false, negative: false }).optional(),
})

export default {
  create,
  update,
}
