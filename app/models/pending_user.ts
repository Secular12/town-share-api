import AdminInvitation from '#models/admin_invitation'
import AppBaseModel from '#models/app_base_model'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class PendingUser extends AppBaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */

  /* Attributes */
  @column()
  declare email: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

  /* Computed */
  @hasMany(() => AdminInvitation)
  declare receivedAdminInvitations: HasMany<typeof AdminInvitation>

  @hasMany(() => NeighborhoodAdminInvitation)
  declare receivedNeighborhoodAdminInvitations: HasMany<typeof NeighborhoodAdminInvitation>

  /* Relationships */

  /* Scopes */

  /* Lucid Properties */

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      receivedAdminInvitationsCount?: number
      receivedNeighborhoodAdminInvitationsCount?: number
    } = {}

    if (this.$extras.receivedAdminInvitations_count !== undefined) {
      extraColumns.receivedAdminInvitationsCount = +this.$extras.receivedAdminInvitations_count
    }

    if (this.$extras.receivedNeighborhoodAdminInvitations_count !== undefined) {
      extraColumns.receivedNeighborhoodAdminInvitationsCount =
        +this.$extras.receivedNeighborhoodAdminInvitations_count
    }

    return extraColumns
  }
}
