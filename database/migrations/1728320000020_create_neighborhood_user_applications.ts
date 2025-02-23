import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'neighborhood_user_applications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.integer('neighborhood_id').unsigned().references(`neighborhoods.id`).notNullable()
      table.integer('user_id').unsigned().references(`users.id`).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
