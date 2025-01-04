import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const organizationUsers = [
  { organization_id: 1, user_id: 7, is_organization_admin: true },
  { organization_id: 2, user_id: 8, is_organization_admin: true },
  { organization_id: 2, user_id: 9, is_organization_admin: true },
  { organization_id: 2, user_id: 10, is_organization_admin: false },
  { organization_id: 2, user_id: 11, is_organization_admin: false },
  { organization_id: 3, user_id: 12, is_organization_admin: true },
  { organization_id: 3, user_id: 13, is_organization_admin: false },
  { organization_id: 2, user_id: 14, is_organization_admin: true },
  { organization_id: 3, user_id: 14, is_organization_admin: true },
  { organization_id: 1, user_id: 15, is_organization_admin: true },
  { organization_id: 2, user_id: 15, is_organization_admin: false },
  { organization_id: 2, user_id: 16, is_organization_admin: false },
  { organization_id: 3, user_id: 16, is_organization_admin: false },
  { organization_id: 1, user_id: 17, is_organization_admin: false },
  { organization_id: 2, user_id: 17, is_organization_admin: false },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('organization_user').multiInsert(organizationUsers)
  }
}
