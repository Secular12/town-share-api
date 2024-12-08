import OrganizationLocation from '#models/organization_location'
import UserLocation from '#models/user_location'
import { BaseModel, column, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'
import vine from '@vinejs/vine'

export default class Neighborhood extends BaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */

  /* Attributes */
  @column()
  declare city: string

  @column()
  declare name: string

  @column()
  declare state: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

  /* Computed */

  /* Relationships */
  @manyToMany(() => User, {
    pivotTable: 'neighborhood_admins',
    pivotRelatedForeignKey: 'admin_id',
  })
  declare admins: ManyToMany<typeof User>

  @hasMany(() => OrganizationLocation)
  declare organizationLocations: HasMany<typeof OrganizationLocation>

  @hasMany(() => UserLocation)
  declare userLocations: HasMany<typeof UserLocation>

  /* Scopes */
  static existsWithOrganization = scope((query, organizationId: number | number[]) => {
    query.whereExists((whereExistsQuery) => {
      whereExistsQuery
        .from('organization_locations')
        .whereColumn('organization_locations.neighborhood_id', 'neighborhoods.id')
        .if(
          vine.helpers.isArray(organizationId),
          (userIdArrayQuery) => {
            userIdArrayQuery.whereIn(
              'organization_locations.organization_id',
              organizationId as number[]
            )
          },
          (userIdNotArrayQuery) => {
            userIdNotArrayQuery.where(
              'organization_locations.organization_id',
              organizationId as number
            )
          }
        )
    })
  })

  static existsWithUser = scope((query, userId: number | number[]) => {
    query.whereExists((whereExistsQuery) => {
      whereExistsQuery
        .select('user_locations.neighborhood_id')
        .from('user_locations')
        .whereColumn('user_locations.neighborhood_id', 'neighborhoods.id')
        .if(
          vine.helpers.isArray(userId),
          (userIdArrayQuery) => {
            userIdArrayQuery.whereIn('user_locations.user_id', userId as number[])
          },
          (userIdNotArrayQuery) => {
            userIdNotArrayQuery.where('user_locations.user_id', userId as number)
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
            .whereColumn('organization_locations.neighborhood_id', 'neighborhoods.id')
            .if(
              vine.helpers.isArray(userId),
              (userIdArrayQuery) => {
                userIdArrayQuery.whereIn('organization_location_user.user_id', userId as number[])
              },
              (userIdNotArrayQuery) => {
                userIdNotArrayQuery.where('organization_location_user.user_id', userId as number)
              }
            )
        })
    })
  })

  /* Lucid Properties */

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      adminsCount?: number
      organizationLocationsCount?: number
      userLocationsCount?: number
    } = {}

    if (this.$extras.admins_count !== undefined) {
      extraColumns.adminsCount = +this.$extras.admins_count
    }

    if (this.$extras.organizationLocations_count !== undefined) {
      extraColumns.organizationLocationsCount = +this.$extras.organizationLocations_count
    }

    if (this.$extras.userLocations_count !== undefined) {
      extraColumns.userLocationsCount = +this.$extras.userLocations_count
    }

    return extraColumns
  }
}
