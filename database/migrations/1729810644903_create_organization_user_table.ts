import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_user'
  protected usersTableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['organization_id', 'user_id'])
      table
        .integer('organization_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organizations')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')

      table.boolean('is_organization_admin').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
