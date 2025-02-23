import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('tokenable_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.text('abilities').notNullable()
      table.string('hash').notNullable()
      table.string('name').nullable()
      table.string('type').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('last_used_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
