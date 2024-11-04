import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'neighborhoods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('city').notNullable()
      table.string('name').notNullable().unique()
      table.string('state').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
