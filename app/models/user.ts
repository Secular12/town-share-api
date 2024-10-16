import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

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

  @column({ serializeAs: null })
  declare phoneExtension: string | null

  @column({ serializeAs: null })
  declare phoneNumber: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /* Computed */

  /* Relationships */

  /* Scopes */
}
