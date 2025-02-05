import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

const includesString = (value: unknown, substring: string, field: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const includesSubstring = value.includes(substring)

  if (!includesSubstring) {
    field.report(`The {{ field }} must include the substring '${substring}'`, 'includes', field)
  }
}

export const includesStringRule = vine.createRule(includesString)
