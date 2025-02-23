import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_location_user'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['organization_location_id', 'user_id'])
      table
        .integer('organization_location_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organization_locations')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
