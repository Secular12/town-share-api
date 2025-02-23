import Neighborhood from '#models/neighborhood'
import Organization from '#models/organization'
import User from '#models/user'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class OrganizationLocation extends BaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare organizationId: number

  /* Relationship IDs */
  @column()
  declare neighborhoodId: number

  /* Attributes */
  @column()
  declare city: string

  @column()
  declare name: string | null

  @column()
  declare state: string

  @column()
  declare street: string

  @column()
  declare zip: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null

  /* Computed */

  /* Relationships */
  @belongsTo(() => Neighborhood)
  declare neighborhood: BelongsTo<typeof Neighborhood>

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @manyToMany(() => User)
  declare users: ManyToMany<typeof User>

  /* Scopes */

  /* Lucid Properties */

  /* Lucid Methods */
}
