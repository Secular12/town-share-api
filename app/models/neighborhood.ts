import AppBaseModel from '#models/app_base_model'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import NeighborhoodUserLocation from '#models/neighborhood_user_location'
// import OrganizationLocation from '#models/organization_location'
import User from '#models/user'
import { column, hasMany, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import vine from '@vinejs/vine'

export default class Neighborhood extends AppBaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */

  /* Attributes */
  @column()
  declare city: string

  @column()
  declare country: string

  @column()
  declare name: string

  @column()
  declare state: string

  @column()
  declare zip: string | null

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

  /* Computed */

  /* Relationships */
  @manyToMany(() => User, {
    onQuery: (query) => {
      query
        .whereNull('neighborhood_user.neighborhood_user_deactivated_at')
        .whereNull('deactivated_at')
    },
    pivotColumns: ['is_neighborhood_admin', 'neighborhood_user_deactivated_at'],
    pivotTable: 'neighborhood_user',
  })
  declare activeUsers: ManyToMany<typeof User>

  @hasMany(() => NeighborhoodAdminInvitation)
  declare adminInvitations: HasMany<typeof NeighborhoodAdminInvitation>

  @manyToMany(() => User, {
    onQuery: (query) => {
      query
        .where('neighborhood_user.is_neighborhood_admin', true)
        .whereNull('neighborhood_user.neighborhood_user_deactivated_at')
        .whereNull('deactivated_at')
    },
    pivotColumns: ['is_neighborhood_admin', 'neighborhood_user_deactivated_at'],
    pivotTable: 'neighborhood_user',
  })
  declare admins: ManyToMany<typeof User>

  @manyToMany(() => User, {
    onQuery: (query) => {
      query.where((whereQuery) => {
        whereQuery
          .whereNotNull('neighborhood_user.neighborhood_user_deactivated_at')
          .orWhereNotNull('deactivated_at')
      })
    },
    pivotColumns: ['is_neighborhood_admin', 'neighborhood_user_deactivated_at'],
    pivotTable: 'neighborhood_user',
  })
  declare inactiveUsers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotColumns: ['is_neighborhood_admin', 'neighborhood_user_deactivated_at'],
    pivotTable: 'neighborhood_user',
  })
  declare users: ManyToMany<typeof User>

  // @hasMany(() => OrganizationLocation)
  // declare organizationLocations: HasMany<typeof OrganizationLocation>

  @hasMany(() => NeighborhoodUserLocation)
  declare userLocations: HasMany<typeof NeighborhoodUserLocation>

  /* Scopes */
  // static existsWithOrganization = scope((query, organizationId: number | number[]) => {
  //   query.whereExists((whereExistsQuery) => {
  //     whereExistsQuery
  //       .from('organization_locations')
  //       .whereColumn('organization_locations.neighborhood_id', 'neighborhoods.id')
  //       .if(
  //         vine.helpers.isArray(organizationId),
  //         (userIdArrayQuery) => {
  //           userIdArrayQuery.whereIn(
  //             'organization_locations.organization_id',
  //             organizationId as number[]
  //           )
  //         },
  //         (userIdNotArrayQuery) => {
  //           userIdNotArrayQuery.where(
  //             'organization_locations.organization_id',
  //             organizationId as number
  //           )
  //         }
  //       )
  //   })
  // })

  static existsWithUser = scope((query, userId: number | number[]) => {
    query.whereExists((whereExistsQuery) => {
      whereExistsQuery
        .select('neighborhood_user.neighborhood_id')
        .from('neighborhood_user')
        .whereColumn('neighborhood_user.neighborhood_id', 'neighborhoods.id')
        .if(
          vine.helpers.isArray(userId),
          (userIdArrayQuery) => {
            userIdArrayQuery.whereIn('neighborhood_user.user_id', userId as number[])
          },
          (userIdNotArrayQuery) => {
            userIdNotArrayQuery.where('neighborhood_user.user_id', userId as number)
          }
        )
      // .union((unionQuery) => {
      //   unionQuery
      //     .select('organization_locations.neighborhood_id')
      //     .from('organization_location_user')
      //     .join(
      //       'organization_locations',
      //       'organization_locations.id',
      //       'organization_location_user.organization_location_id'
      //     )
      //     .whereColumn('organization_locations.neighborhood_id', 'neighborhoods.id')
      //     .if(
      //       vine.helpers.isArray(userId),
      //       (userIdArrayQuery) => {
      //         userIdArrayQuery.whereIn('organization_location_user.user_id', userId as number[])
      //       },
      //       (userIdNotArrayQuery) => {
      //         userIdNotArrayQuery.where('organization_location_user.user_id', userId as number)
      //       }
      //     )
      // })
    })
  })

  /* Lucid Properties */

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      adminInvitationsCount?: number
      isNeighborhoodAdmin?: boolean
      // organizationLocationsCount?: number
      neighborhoodUserDeactivatedAt?: DateTime
      userLocationsCount?: number
      usersCount?: number
    } = {}

    if (this.$extras.adminInvitations_count !== undefined) {
      extraColumns.adminInvitationsCount = +this.$extras.adminInvitations_count
    }

    if (this.$extras.pivot_is_neighborhood_admin !== undefined) {
      extraColumns.isNeighborhoodAdmin = !!this.$extras.pivot_is_neighborhood_admin
    }

    // if (this.$extras.organizationLocations_count !== undefined) {
    //   extraColumns.organizationLocationsCount = +this.$extras.organizationLocations_count
    // }

    if (this.$extras.pivot_neighborhood_user_deactivated_at !== undefined) {
      extraColumns.neighborhoodUserDeactivatedAt = DateTime.fromSQL(
        this.$extras.pivot_neighborhood_user_deactivated_at
      ).toUTC()
    }

    if (this.$extras.userLocations_count !== undefined) {
      extraColumns.userLocationsCount = +this.$extras.userLocations_count
    }

    if (this.$extras.users_count !== undefined) {
      extraColumns.usersCount = +this.$extras.users_count
    }

    return extraColumns
  }
}
