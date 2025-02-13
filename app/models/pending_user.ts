import AdminInvitation from '#models/admin_invitation'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class PendingUser extends BaseModel {
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

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Computed */
  @hasMany(() => AdminInvitation)
  declare receivedAdminInvitations: HasMany<typeof AdminInvitation>

  /* Relationships */

  /* Scopes */

  /* Lucid Properties */

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      receivedAdminInvitationsCount?: number
    } = {}

    if (this.$extras.receivedAdminInvitations_count !== undefined) {
      extraColumns.receivedAdminInvitationsCount = +this.$extras.receivedAdminInvitations_count
    }

    return extraColumns
  }
}
