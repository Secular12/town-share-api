import ObjectUtil from '#utils/object'
import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

export type UniqueObjectOptions = {
  columns: string[]
  id?: number
  table: string
}

export type UniqueStringOptions = {
  column: string
  id?: number
  table: string
}

const uniqueString = async (value: unknown, options: UniqueStringOptions, field: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const row = await db
    .query()
    .select(options.column)
    .from(options.table)
    .where(options.column as string, value)
    .if(options.id, (query) => {
      query.whereNot('id', options.id!)
    })
    .first()

  if (row) {
    field.report('The {{ field }} field must be unique', 'unique', field)
  }
}

const uniqueObject = async (value: unknown, options: UniqueObjectOptions, field: FieldContext) => {
  if (!vine.helpers.isObject(value)) {
    return
  }

  const valueWithSnakeCasedKeys = ObjectUtil.mapKeys(value, (_, key) =>
    string.snakeCase(key as string)
  )

  const columns = options.columns.map((column) => ({
    camel: string.camelCase(column),
    snake: string.snakeCase(column),
  }))

  const camelColumns = columns.map(({ camel }) => camel)
  const snakeColumns = columns.map(({ snake }) => snake)

  if (snakeColumns.some((column) => !Object.keys(valueWithSnakeCasedKeys).includes(column))) {
    return
  }

  const rowData = options.id
    ? await db.query().select(snakeColumns).from(options.table).where('id', options.id).first()
    : {}

  const data = {
    ...rowData,
    ...valueWithSnakeCasedKeys,
  }

  const query = db.query().select(snakeColumns).from(options.table)

  columns.forEach((column) => {
    if (data[column.snake]) {
      query.where(column.snake, data[column.snake] as any)
    }
  })

  if (options.id) {
    query.whereNot('id', options.id)
  }

  const row = await query.first()

  if (row) {
    field.report(
      `The ${camelColumns.join(', ')} fields${field.name ? ` in the ${field.name} object` : ''} must be a unique combination`,
      'unique',
      field
    )
  }
}

export const uniqueObjectRule = vine.createRule(uniqueObject)
export const uniqueStringRule = vine.createRule(uniqueString)
