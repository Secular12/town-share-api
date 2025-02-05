import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const neighborhoodAdmins = [
  { admin_id: 1, neighborhood_id: 1 },
  { admin_id: 2, neighborhood_id: 1 },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('neighborhood_admins').multiInsert(neighborhoodAdmins)
  }
}
