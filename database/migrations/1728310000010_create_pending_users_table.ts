import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected usersTable = 'pending_users'

  async up() {
    this.schema.createTable(this.usersTable, (table) => {
      table.increments('id').notNullable()

      table.string('email', 254).unique().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.usersTable)
  }
}
