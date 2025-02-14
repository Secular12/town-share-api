import Neighborhood from '#models/neighborhood'
import PendingUser from '#models/pending_user'
import User from '#models/user'
import env from '#start/env'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { BaseModel, belongsTo, column, computed, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class NeighborhoodAdminInvitation extends BaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */
  @column()
  declare inviterId: number

  @column()
  declare neighborhoodId: number

  @column()
  declare pendingUserId: number

  @column()
  declare userId: number

  /* Attributes */
  @column()
  declare message: string | null

  /* Timestamps */
  @column.dateTime()
  declare acceptedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare deniedAt: DateTime | null

  @column.dateTime()
  declare revokedAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Computed */
  @computed()
  get isPending() {
    return !this.acceptedAt && !this.deniedAt && !this.revokedAt
  }

  /* Relationships */
  @belongsTo(() => User, {
    foreignKey: 'inviterId',
  })
  declare inviter: BelongsTo<typeof User>

  @belongsTo(() => Neighborhood)
  declare neighborhood: BelongsTo<typeof Neighborhood>

  @belongsTo(() => PendingUser)
  declare pendingUser: BelongsTo<typeof PendingUser>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /* Scopes */
  static isPending = scope((scopeQuery) => {
    scopeQuery.whereNull('acceptedAt').whereNull('deniedAt').whereNull('revokedAt')
  })

  static isNotPending = scope((scopeQuery) => {
    scopeQuery.where((whereQuery) => {
      whereQuery.whereNotNull('acceptedAt').orWhereNotNull('deniedAt').orWhereNotNull('revokedAt')
    })
  })

  /* Lucid Properties */
  static adminInvitationTokens = DbAccessTokensProvider.forModel(NeighborhoodAdminInvitation, {
    expiresIn: env.get('TOKEN_INVITATION_EXPIRATION'),
    prefix: 'nait_',
    table: 'neighborhood_admin_invitation_tokens',
    tokenSecretLength: 40,
    type: 'neighborhood_admin_invitation',
  })

  /* Lucid Methods */
}
