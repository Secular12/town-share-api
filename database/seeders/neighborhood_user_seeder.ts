import AppBaseSeeder from '#database/seeders/app_base_seeder'
import { NeighborhoodUserSeederData } from '#types/seeder'
import db from '@adonisjs/lucid/services/db'

export default class NeighborhoodUserSeeder extends AppBaseSeeder {
  public static async runWith(neighborhoodUsersData: NeighborhoodUserSeederData[]) {
    const neighborhoodUserItems = this.getItems(neighborhoodUsersData)

    return db.table('neighborhood_user').multiInsert(neighborhoodUserItems)
  }
}
