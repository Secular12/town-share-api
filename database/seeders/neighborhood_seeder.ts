import { NeighborhoodFactory } from '#database/factories/neighborhood_factory'
import AppBaseSeeder from '#database/seeders/app_base_seeder'
import NeighborhoodAdminInvitationSeeder from '#database/seeders/neighborhood_admin_invitation_seeder'
import NeighborhoodUserSeeder from '#database/seeders/neighborhood_user_seeder'
import { NeighborhoodSeederData } from '#types/seeder'

export default class NeighborhoodSeeder extends AppBaseSeeder {
  public static async runWith(neighborhoodsData: NeighborhoodSeederData[]) {
    const neighborhoodItems = this.getItems(neighborhoodsData)

    const neighborhoods = await NeighborhoodFactory.merge(neighborhoodItems).createMany(
      neighborhoodItems.length
    )

    for await (const [neighborhoodIndex, neighborhood] of neighborhoods.entries()) {
      await neighborhood.refresh()

      const neighborhoodData = neighborhoodsData[neighborhoodIndex]

      if (neighborhoodData.adminInvitations) {
        await NeighborhoodAdminInvitationSeeder.runWith(
          neighborhoodData.adminInvitations.map((adminInvitation) => ({
            ...adminInvitation,
            data: {
              ...adminInvitation.data,
              neighborhoodId: neighborhood.id,
            },
          }))
        )

        await neighborhood.load('adminInvitations')
      }

      if (neighborhoodData.users) {
        await NeighborhoodUserSeeder.runWith(
          neighborhoodData.users.map((neighborhoodUser) => ({
            ...neighborhoodUser,
            data: {
              ...neighborhoodUser.data,
              neighborhood_id: neighborhood.id,
            },
          }))
        )
      }
    }
  }
}
