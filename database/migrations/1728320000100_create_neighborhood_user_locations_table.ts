import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'neighborhood_user_locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('neighborhood_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('neighborhoods')
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users')

      table.string('city').notNullable()
      table.string('name').nullable()
      table.string('state').notNullable()
      table.string('street').notNullable()
      table.string('zip').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
