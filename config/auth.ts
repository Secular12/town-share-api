import User from '#models/user'
import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, SessionLucidUserProvider } from '@adonisjs/auth/session'
import type { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'
import { SessionGuardUser } from '@adonisjs/auth/types/session'

class CustomUserProvider extends SessionLucidUserProvider<typeof User> {
  /**
   * Finds a user by the user id
   */
  override async findById(
    identifier: string | number | BigInt
  ): Promise<SessionGuardUser<User> | null> {
    const model = await this.getModel()
    const user = await model
      .query()
      .where('id', Number(identifier))
      .preload('adminedNeighborhoods')
      // .preload('organizations', (organizationsQuery) => {
      //   organizationsQuery.where('organization_user.is_organization_admin', true).select('id')
      // })
      .first()

    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }
}

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: new CustomUserProvider({
        model: () => import('#models/user'),
      }),
    }),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
