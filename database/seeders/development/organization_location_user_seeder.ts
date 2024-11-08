import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const organizationLocationUsers = [
  { organization_location_id: 1, user_id: 2 },
  { organization_location_id: 2, user_id: 2 },
  { organization_location_id: 3, user_id: 2 },
  { organization_location_id: 1, user_id: 3 },
  { organization_location_id: 2, user_id: 3 },
  { organization_location_id: 2, user_id: 4 },
  { organization_location_id: 3, user_id: 5 },
  { organization_location_id: 4, user_id: 5 },
  { organization_location_id: 3, user_id: 6 },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('organization_location_user').multiInsert(organizationLocationUsers)
  }
}
