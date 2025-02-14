import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'neighborhood_admins'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(['admin_id', 'neighborhood_id'])
      table.integer('admin_id').unsigned().references(`users.id`).notNullable()
      table.integer('neighborhood_id').unsigned().references(`neighborhoods.id`).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
