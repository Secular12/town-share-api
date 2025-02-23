import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export const neighborhoodUsers = [
  { neighborhood_id: 1, user_id: 4 },
  { neighborhood_id: 1, user_id: 9 },
  { neighborhood_id: 2, user_id: 7 },
  { neighborhood_id: 2, user_id: 10 },
  { neighborhood_id: 2, user_id: 14 },
  { neighborhood_id: 3, user_id: 9 },
  { neighborhood_id: 3, user_id: 13 },
]

export default class extends BaseSeeder {
  async run() {
    await db.table('neighborhood_user').multiInsert(neighborhoodUsers)
  }
}
