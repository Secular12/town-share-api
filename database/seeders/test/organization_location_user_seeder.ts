import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const organizationLocationUsers = [
  { organization_location_id: 1, user_id: 7 },
  { organization_location_id: 2, user_id: 8 },
  { organization_location_id: 2, user_id: 9 },
  { organization_location_id: 3, user_id: 9 },
  { organization_location_id: 2, user_id: 10 },
  { organization_location_id: 2, user_id: 11 },
  { organization_location_id: 3, user_id: 11 },
  { organization_location_id: 4, user_id: 12 },
  { organization_location_id: 5, user_id: 12 },
  { organization_location_id: 4, user_id: 13 },
  { organization_location_id: 5, user_id: 13 },
  { organization_location_id: 2, user_id: 14 },
  { organization_location_id: 4, user_id: 14 },
  { organization_location_id: 1, user_id: 15 },
  { organization_location_id: 2, user_id: 15 },
  { organization_location_id: 3, user_id: 15 },
  { organization_location_id: 2, user_id: 16 },
  { organization_location_id: 4, user_id: 16 },
  { organization_location_id: 5, user_id: 16 },
  { organization_location_id: 1, user_id: 17 },
  { organization_location_id: 3, user_id: 17 },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('organization_location_user').multiInsert(organizationLocationUsers)
  }
}
