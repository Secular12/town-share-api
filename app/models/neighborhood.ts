import OrganizationLocation from '#models/organization_location'
import UserLocation from '#models/user_location'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'

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
    pivotRelatedForeignKey: 'admin_id',
  })
  declare admins: ManyToMany<typeof User>

  @hasMany(() => OrganizationLocation)
  declare organizationLocations: HasMany<typeof OrganizationLocation>

  @hasMany(() => UserLocation)
  declare userLocations: HasMany<typeof UserLocation>

  /* Scopes */

  /* Lucid Properties */

  /* Lucid Methods */
}
