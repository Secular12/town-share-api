import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'neighborhood_user'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['neighborhood_id', 'user_id'])

      table.integer('neighborhood_id').unsigned().references(`neighborhoods.id`).notNullable()
      table.integer('user_id').unsigned().references(`users.id`).notNullable()

      table.boolean('is_neighborhood_admin').notNullable().defaultTo(false)

      table.timestamp('neighborhood_user_deactivated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
