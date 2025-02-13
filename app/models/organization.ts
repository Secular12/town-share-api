import OrganizationLocation from '#models/organization_location'
import User from '#models/user'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Organization extends BaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */

  /* Attributes */
  @column()
  declare name: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Computed */

  /* Relationships */
  @hasMany(() => OrganizationLocation)
  declare locations: HasMany<typeof OrganizationLocation>

  @manyToMany(() => User, {
    pivotColumns: ['is_organization_admin'],
  })
  declare users: ManyToMany<typeof User>

  /* Scopes */

  /* Lucid Methods */
  serializeExtras() {
    const extraColumns: {
      isOrganizationAdmin?: boolean
    } = {}

    if (this.$extras.pivot_is_organization_admin !== undefined) {
      extraColumns.isOrganizationAdmin = this.$extras.pivot_is_organization_admin
    }

    return extraColumns
  }
}
