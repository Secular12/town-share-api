import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

export type StringTimezoneOptions = undefined | null

const stringTimezone = async (value: unknown, _: StringTimezoneOptions, field: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const testedDateTimeValue = DateTime.local().setZone(value)

  if (!testedDateTimeValue.isValid) {
    field.report('The {{ field }} must be a supported IANA zone', 'timezone', field)
  }
}

export const stringTimezoneRule = vine.createRule(stringTimezone)
