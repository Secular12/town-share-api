import factory from '@adonisjs/lucid/factories'
import FakerUtils from '#utils/faker'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'

export const NeighborhoodAdminInvitationFactory = factory
  .define(NeighborhoodAdminInvitation, async ({ faker }) => {
    return {
      message: FakerUtils.randomCall(faker.lorem.paragraphs, 0.3),
    }
  })
  .build()
