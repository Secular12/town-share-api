import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'admin_invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.integer('inviter_id').unsigned().notNullable().references('id').inTable('users')
      table
        .integer('pending_user_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('pending_users')
      table.integer('user_id').nullable().unsigned().references('id').inTable('users')

      table.text('message').nullable()

      table.timestamp('accepted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('denied_at').nullable()
      table.timestamp('revoked_at').nullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
