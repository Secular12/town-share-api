import factory from '@adonisjs/lucid/factories'
import FakerUtils from '#utils/faker'
import AdminInvitation from '#models/admin_invitation'

export const AdminInvitationFactory = factory
  .define(AdminInvitation, async ({ faker }) => {
    return {
      message: FakerUtils.randomCall(faker.lorem.paragraphs, 0.3),
    }
  })
  .build()
