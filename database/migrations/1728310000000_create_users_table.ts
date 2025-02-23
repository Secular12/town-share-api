import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected usersTable = 'users'

  async up() {
    this.schema.createTable(this.usersTable, (table) => {
      table.increments('id').notNullable()

      table.integer('sponsor_id').unsigned().nullable().references('id').inTable('users')

      table.string('email', 254).unique().notNullable()
      table.string('first_name').notNullable()
      table.boolean('is_application_admin').defaultTo(false).notNullable()
      table.string('last_name').notNullable()
      table.string('middle_name').nullable()
      table.string('name_suffix').nullable()
      table.string('password').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('deactivated_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.usersTable)
  }
}
