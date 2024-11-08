import Neighborhood from '#models/neighborhood'
import Organization from '#models/organization'
import OrganizationLocation from '#models/organization_location'
import UserLocation from '#models/user_location'
import env from '#start/env'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import vine from '@vinejs/vine'
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
  declare isApplicationAdmin: boolean

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
  @manyToMany(() => Neighborhood, {
    pivotTable: 'neighborhood_admins',
    pivotForeignKey: 'admin_id',
  })
  declare adminedNeighborhoods: ManyToMany<typeof Neighborhood>

  @hasMany(() => UserLocation)
  declare locations: HasMany<typeof UserLocation>

  @manyToMany(() => OrganizationLocation)
  declare organizationLocations: ManyToMany<typeof OrganizationLocation>

  @manyToMany(() => Organization, {
    pivotColumns: ['is_organization_admin'],
  })
  declare organizations: ManyToMany<typeof Organization>

  /* Scopes */
  static existsWithNeighborhood = scope((query, neighborhoodId: number | number[]) => {
    query.whereExists((whereExistsQuery) => {
      whereExistsQuery
        .select('user_locations.neighborhood_id')
        .from('user_locations')
        .whereColumn('user_locations.user_id', 'users.id')
        .if(
          vine.helpers.isArray(neighborhoodId),
          (neighborhoodIdArrayQuery) => {
            neighborhoodIdArrayQuery.whereIn(
              'user_locations.neighborhood_id',
              neighborhoodId as number[]
            )
          },
          (neighborhoodIdNotArrayQuery) => {
            neighborhoodIdNotArrayQuery.where(
              'user_locations.neighborhood_id',
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

  /* Lucid Properties */
  static resetTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: env.get('TOKEN_FORGOT_PASSWORD_EXPIRATION'),
    prefix: 'urt_',
    table: 'user_access_tokens',
    tokenSecretLength: 40,
    type: 'reset_token',
  })

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      isOrganizationAdmin?: boolean
      locationsCount?: number
      organizationLocationsCount?: number
      organizationsCount?: number
    } = {}

    if (this.$extras.pivot_is_organization_admin !== undefined) {
      extraColumns.isOrganizationAdmin = this.$extras.pivot_is_organization_admin
    }

    if (this.$extras.locations_count !== undefined) {
      extraColumns.locationsCount = +this.$extras.locations_count
    }

    if (this.$extras.organizationLocations_count !== undefined) {
      extraColumns.organizationLocationsCount = +this.$extras.organizationLocations_count
    }

    if (this.$extras.organizations_count !== undefined) {
      extraColumns.organizationsCount = +this.$extras.organizations_count
    }

    return extraColumns
  }
}
