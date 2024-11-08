import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'neighborhood_admins'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['neighborhood_id', 'admin_id'])
      table.integer('neighborhood_id').unsigned().references(`neighborhoods.id`).notNullable()
      table.integer('admin_id').unsigned().references(`users.id`).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
