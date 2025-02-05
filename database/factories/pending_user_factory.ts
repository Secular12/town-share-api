import factory from '@adonisjs/lucid/factories'
import PendingUser from '#models/pending_user'

export const PendingUserFactory = factory
  .define(PendingUser, async ({ faker }) => {
    return {
      email: faker.internet.email(),
    }
  })
  .build()
