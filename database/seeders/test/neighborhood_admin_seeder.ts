import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const neighborhoodAdmins = [
  { neighborhood_id: 1, admin_id: 4 },
  { neighborhood_id: 1, admin_id: 9 },
  { neighborhood_id: 2, admin_id: 7 },
  { neighborhood_id: 2, admin_id: 10 },
  { neighborhood_id: 2, admin_id: 14 },
  { neighborhood_id: 3, admin_id: 13 },
  { neighborhood_id: 3, admin_id: 9 },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('neighborhood_admins').multiInsert(neighborhoodAdmins)
  }
}
