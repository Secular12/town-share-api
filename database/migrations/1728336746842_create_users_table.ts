import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected usersTable = 'users'

  async up() {
    this.schema.createTable(this.usersTable, (table) => {
      table.increments('id').notNullable()

      table.string('email', 254).notNullable().unique()
      table.string('first_name').notNullable()
      table.boolean('is_admin').defaultTo(false).notNullable()
      table.string('last_name').notNullable()
      table.string('middle_name').nullable()
      table.string('name_suffix').nullable()
      table.string('password').notNullable()
      table.string('phone_extension').nullable()
      table.string('phone_number').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.usersTable)
  }
}
