import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const organizationUsers = [
  { organization_id: 1, user_id: 3, is_organization_admin: true },
  { organization_id: 1, user_id: 4, is_organization_admin: false },
  { organization_id: 2, user_id: 5, is_organization_admin: true },
  { organization_id: 2, user_id: 6, is_organization_admin: false },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('organization_user').multiInsert(organizationUsers)
  }
}
