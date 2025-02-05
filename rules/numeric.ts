import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

export type StringNumericOptions = {
  decimal?: boolean
  negative?: boolean
}

const stringNumeric = async (
  value: unknown,
  options: StringNumericOptions | undefined,
  field: FieldContext
) => {
  if (typeof value !== 'string') {
    return
  }

  const opts = {
    decimal: true,
    negative: true,
    ...options,
  }

  const valueAsNumber = vine.helpers.asNumber(value)
  const valueHasDecimal = valueAsNumber % 1 !== 0

  const isNumeric = vine.helpers.isNumeric(value)
    ? opts.decimal
      ? true
      : opts.negative
        ? !valueHasDecimal
        : !valueHasDecimal && valueAsNumber >= 0
    : false

  if (!isNumeric) {
    field.report('The {{ field }} must be a numeric string', 'numeric', field)
  }
}

export const stringNumericRule = vine.createRule(stringNumeric)
