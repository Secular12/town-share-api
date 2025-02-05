import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const organizationUsers = [
  // {
  //   organization_id: 1,
  //   user_id: 7,
  //   is_organization_admin: true,
  // },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('organization_user').multiInsert(organizationUsers)
  }
}
