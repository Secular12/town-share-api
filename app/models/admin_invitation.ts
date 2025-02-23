import AppBaseModel from '#models/app_base_model'
import User from '#models/user'
import PendingUser from '#models/pending_user'
import env from '#start/env'
import { IndexPayload } from '#validators/admin_invitation'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { belongsTo, column, computed, scope } from '@adonisjs/lucid/orm'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

type Builder = ModelQueryBuilderContract<typeof AdminInvitation>

export default class AdminInvitation extends AppBaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */
  @column()
  declare inviterId: number

  @column()
  declare pendingUserId: number | null

  @column()
  declare userId: number | null

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

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

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

  static search = scope((scopeQuery, payload: IndexPayload) => {
    const query = scopeQuery as Builder

    query.withScopes((scopes) => {
      if (vine.helpers.isString(payload.searchBy) && payload.searchBy.length > 0) {
        if (payload.searchBy === 'email') {
          scopes.searchByEmail(payload.search!)
        } else if (payload.searchBy === 'inviterName') {
          scopes.searchByInviterName(payload.search!)
        } else if (payload.searchBy === 'userName') {
          scopes.searchByUserName(payload.search!)
        } else {
          query.whereILike(payload.searchBy as string, `%${payload.search!}%`)
        }
      } else {
        query.where((searchWhereQuery) => {
          const searchByColumns = vine.helpers.isArray(payload.searchBy)
            ? payload.searchBy
            : ['email', 'inviterName', 'userName']

          searchWhereQuery.withScopes((searchWhereScopes) => {
            searchByColumns.forEach((searchByColumn) => {
              if (payload.searchBy === 'email') {
                scopes.searchByEmail(payload.search!)
              } else if (payload.searchBy === 'inviterName') {
                searchWhereScopes.searchByInviterName(payload.search!)
              } else if (payload.searchBy === 'userName') {
                searchWhereScopes.searchByUserName(payload.search!)
              } else {
                searchWhereQuery.orWhereILike(searchByColumn, `%${payload.search}%`)
              }
            })
          })
        })
      }
    })
  })

  static searchByEmail = scope((query, value: string) => {
    query
      .leftJoin('users', 'admin_invitations.user_id', 'users.id')
      .leftJoin('pending_users', 'admin_invitations.pending_user_id', 'pending_users.id')
      .orWhereILike('users.email', `%${value}%`)
      .orWhereILike('pending_users.email', `%${value}%`)
  })

  static searchByInviterName = scope((query, value: string) => {
    query
      .join('users as inviters', 'inviters.id', 'admin_invitations.inviter_id')
      .orWhereRaw(
        `CONCAT_WS(' ', inviters.first_name, inviters.middle_name, inviters.last_name, inviters.name_suffix) ILIKE '%${value}%'`
      )
  })

  static searchByUserName = scope((query, value: string) => {
    query
      .leftJoin('users', 'admin_invitations.user_id', 'users.id')
      .orWhereRaw(
        `CONCAT_WS(' ', users.first_name, users.middle_name, users.last_name, users.name_suffix) ILIKE '%${value}%'`
      )
  })

  /* Lucid Properties */
  static adminInvitationTokens = DbAccessTokensProvider.forModel(AdminInvitation, {
    expiresIn: env.get('TOKEN_INVITATION_EXPIRATION'),
    prefix: 'ait_',
    table: 'admin_invitation_tokens',
    tokenSecretLength: 40,
    type: 'admin_invitation',
  })

  /* Lucid Methods */
}
