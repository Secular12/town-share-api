import AdminInvitation from '#models/admin_invitation'
import Neighborhood from '#models/neighborhood'
import Organization from '#models/organization'
import OrganizationLocation from '#models/organization_location'
import NeighborhoodUserLocation from '#models/neighborhood_user_location'
import UserPhoneNumber from '#models/user_phone_number'
import env from '#start/env'
import type { IndexPayload } from '#validators/user'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import {
  BaseModel,
  belongsTo,
  column,
  computed,
  hasMany,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

type Builder = ModelQueryBuilderContract<typeof User>

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */
  @column()
  declare sponsorId: number | null

  /* Attributes */
  @column()
  declare email: string

  @column()
  declare firstName: string

  @column()
  declare isApplicationAdmin: boolean

  @column()
  declare lastName: string

  @column()
  declare middleName: string | null

  @column()
  declare nameSuffix: string | null

  @column({ serializeAs: null })
  declare password: string | null

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare deactivatedAt: DateTime | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Computed */
  @computed()
  get fullName() {
    return [this.firstName, this.middleName, this.lastName, this.nameSuffix]
      .filter((x) => !!x)
      .join(' ')
  }

  @computed()
  get isActive() {
    return !this.deactivatedAt
  }

  @computed()
  get name() {
    return [this.firstName, this.lastName, this.nameSuffix].filter((x) => !!x).join(' ')
  }

  /* Relationships */
  @hasMany(() => AdminInvitation)
  declare receivedAdminInvitations: HasMany<typeof AdminInvitation>

  @hasMany(() => AdminInvitation, {
    foreignKey: 'inviterId',
  })
  declare sentAdminInvitations: HasMany<typeof AdminInvitation>

  @manyToMany(() => Neighborhood, {
    pivotTable: 'neighborhood_admins',
    pivotForeignKey: 'admin_id',
  })
  declare adminedNeighborhoods: ManyToMany<typeof Neighborhood>

  @hasMany(() => NeighborhoodUserLocation)
  declare neighborhoodLocations: HasMany<typeof NeighborhoodUserLocation>

  @manyToMany(() => OrganizationLocation)
  declare organizationLocations: ManyToMany<typeof OrganizationLocation>

  @manyToMany(() => Organization, {
    pivotColumns: ['is_organization_admin'],
  })
  declare organizations: ManyToMany<typeof Organization>

  @hasMany(() => UserPhoneNumber)
  declare phoneNumbers: HasMany<typeof UserPhoneNumber>

  @belongsTo(() => User, {
    foreignKey: 'sponsorId',
  })
  declare sponsor: BelongsTo<typeof User>

  @hasMany(() => User, {
    foreignKey: 'sponsorId',
  })
  declare sponsoredUsers: HasMany<typeof User>

  /* Scopes */
  static existsWithNeighborhood = scope((query, neighborhoodId: number | number[]) => {
    query.whereExists((whereExistsQuery) => {
      whereExistsQuery
        .select('neighborhood_user_locations.neighborhood_id')
        .from('neighborhood_user_locations')
        .whereColumn('neighborhood_user_locations.user_id', 'users.id')
        .if(
          vine.helpers.isArray(neighborhoodId),
          (neighborhoodIdArrayQuery) => {
            neighborhoodIdArrayQuery.whereIn(
              'neighborhood_user_locations.neighborhood_id',
              neighborhoodId as number[]
            )
          },
          (neighborhoodIdNotArrayQuery) => {
            neighborhoodIdNotArrayQuery.where(
              'neighborhood_user_locations.neighborhood_id',
              neighborhoodId as number
            )
          }
        )
        .union((unionQuery) => {
          unionQuery
            .select('organization_locations.neighborhood_id')
            .from('organization_location_user')
            .join(
              'organization_locations',
              'organization_locations.id',
              'organization_location_user.organization_location_id'
            )
            .whereColumn('organization_location_user.user_id', 'users.id')
            .if(
              vine.helpers.isArray(neighborhoodId),
              (neighborhoodIdArrayQuery) => {
                neighborhoodIdArrayQuery.whereIn(
                  'organization_locations.neighborhood_id',
                  neighborhoodId as number[]
                )
              },
              (neighborhoodIdNotArrayQuery) => {
                neighborhoodIdNotArrayQuery.where(
                  'organization_locations.neighborhood_id',
                  neighborhoodId as number
                )
              }
            )
        })
    })
  })

  static existsWithOrganization = scope((query, organizationId: number | number[]) => {
    query.whereExists((whereExistsQuery) => {
      whereExistsQuery
        .from('organization_user')
        .whereColumn('organization_user.user_id', 'users.id')
        .if(
          vine.helpers.isArray(organizationId),
          (organizationIdArrayQuery) => {
            organizationIdArrayQuery.whereIn(
              'organization_user.organization_id',
              organizationId as number[]
            )
          },
          (organizationIdNotArrayQuery) => {
            organizationIdNotArrayQuery.where('organization_user.organization_id', organizationId)
          }
        )
    })
  })

  static existsWithOrganizationLocation = scope(
    (query, organizationLocationId: number | number[]) => {
      query.whereExists((whereExistsQuery) => {
        whereExistsQuery
          .from('organization_location_user')
          .whereColumn('organization_location_user.user_id', 'users.id')
          .if(
            vine.helpers.isArray(organizationLocationId),
            (organizationIdArrayQuery) => {
              organizationIdArrayQuery.whereIn(
                'organization_location_user.organization_location_id',
                organizationLocationId as number[]
              )
            },
            (organizationIdNotArrayQuery) => {
              organizationIdNotArrayQuery.where(
                'organization_location_user.organization_location_id',
                organizationLocationId
              )
            }
          )
      })
    }
  )

  static isNotActive = scope((query) => {
    query.where((whereQuery) => {
      whereQuery.whereNotNull('deactivatedAt')
    })
  })

  static isActive = scope((query) => {
    query.whereNull('deactivatedAt')
  })

  static search = scope((scopeQuery, payload: IndexPayload) => {
    const query = scopeQuery as Builder

    query.withScopes((scopes) => {
      if (vine.helpers.isString(payload.searchBy) && payload.searchBy.length > 0) {
        if (payload.searchBy === 'name') {
          scopes.searchByName(payload.search!)
        } else if (payload.searchBy === 'fullName') {
          scopes.searchByFullName(payload.search!)
        } else {
          query.whereILike(payload.searchBy as string, `%${payload.search!}%`)
        }
      } else {
        query.where((searchWhereQuery) => {
          const searchByColumns = vine.helpers.isArray(payload.searchBy)
            ? payload.searchBy
            : ['email', 'fullName']

          searchWhereQuery.withScopes((searchWhereScopes) => {
            searchByColumns.forEach((searchByColumn) => {
              if (payload.searchBy === 'name') {
                searchWhereScopes.searchByName(payload.search!)
              } else if (payload.searchBy === 'fullName') {
                searchWhereScopes.searchByFullName(payload.search!)
              } else {
                searchWhereQuery.orWhereILike(searchByColumn, `%${payload.search}%`)
              }
            })
          })
        })
      }
    })
  })

  static searchByFullName = scope((query, value: string) => {
    query.orWhereRaw(
      `CONCAT_WS(' ', first_name, middle_name, last_name, name_suffix) ILIKE '%${value}%'`
    )
  })

  static searchByName = scope((query, value: string) => {
    query.orWhereRaw(`CONCAT_WS(' ', first_name, last_name, name_suffix) ILIKE '%${value}%'`)
  })

  /* Lucid Properties */
  static resetTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: env.get('TOKEN_RESET_PASSWORD_EXPIRATION'),
    prefix: 'urt_',
    table: 'user_tokens',
    tokenSecretLength: 40,
    type: 'reset_password',
  })

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      adminedNeighborhoodsCount?: number
      isOrganizationAdmin?: boolean
      neighborhoodLocationsCount?: number
      organizationLocationsCount?: number
      organizationsCount?: number
      phoneNumbersCount?: number
      receivedAdminInvitationsCount?: number
      sentAdminInvitationsCount?: number
    } = {}

    if (this.$extras.adminedNeighborhoods_count !== undefined) {
      extraColumns.adminedNeighborhoodsCount = +this.$extras.adminedNeighborhoods_count
    }

    if (this.$extras.pivot_is_organization_admin !== undefined) {
      extraColumns.isOrganizationAdmin = this.$extras.pivot_is_organization_admin
    }

    if (this.$extras.neighborhoodLocations_count !== undefined) {
      extraColumns.neighborhoodLocationsCount = +this.$extras.neighborhoodLocations_count
    }

    if (this.$extras.organizationLocations_count !== undefined) {
      extraColumns.organizationLocationsCount = +this.$extras.organizationLocations_count
    }

    if (this.$extras.organizations_count !== undefined) {
      extraColumns.organizationsCount = +this.$extras.organizations_count
    }

    if (this.$extras.phoneNumbers_count !== undefined) {
      extraColumns.phoneNumbersCount = +this.$extras.phoneNumbers_count
    }

    if (this.$extras.receivedAdminInvitations_count !== undefined) {
      extraColumns.receivedAdminInvitationsCount = +this.$extras.receivedAdminInvitations_count
    }

    if (this.$extras.sentAdminInvitations_count !== undefined) {
      extraColumns.sentAdminInvitationsCount = +this.$extras.sentAdminInvitations_count
    }

    return extraColumns
  }
}
