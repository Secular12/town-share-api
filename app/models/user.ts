import env from '#start/env'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */

  /* Attributes */
  @column()
  declare email: string

  @column()
  declare firstName: string

  @column()
  declare isAdmin: boolean

  @column()
  declare lastName: string

  @column()
  declare middleName: string | null

  @column()
  declare nameSuffix: string | null

  @column({ serializeAs: null })
  declare password: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /* Computed */

  /* Relationships */

  /* Scopes */

  /* Lucid Properties */
  static resetTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: env.get('TOKEN_FORGOT_PASSWORD_EXPIRATION'),
    prefix: 'urt_',
    table: 'user_access_tokens',
    tokenSecretLength: 40,
    type: 'reset_token',
  })

  /* Lucid Methods */
}
