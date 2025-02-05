import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const organizationLocationUsers = [
  // {
  //   organization_location_id: 1,
  //   user_id: 2,
  // },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('organization_location_user').multiInsert(organizationLocationUsers)
  }
}
