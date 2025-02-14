import { NeighborhoodFactory } from '#database/factories/neighborhood_factory'
import AppBaseSeeder from '#database/seeders/app_base_seeder'
import { NeighborhoodSeederData } from '#types/seeder'

export default class NeighborhoodSeeder extends AppBaseSeeder {
  public static async runWith(neighborhoodData: NeighborhoodSeederData[]) {
    const neighborhoodItems = this.getItems(neighborhoodData)

    return NeighborhoodFactory.merge(neighborhoodItems).createMany(neighborhoodItems.length)
  }

  private static getItems(neighborhoodData: NeighborhoodSeederData[]) {
    return this.mapData(neighborhoodData, (data) => ({
      id: data.id,
      city: data.city,
      name: data.name,
      state: data.state,
      zip: data.zip,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }))
  }
}
