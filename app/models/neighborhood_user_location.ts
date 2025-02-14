import Neighborhood from '#models/neighborhood'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class NeighborhoodUserLocation extends BaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */
  @column()
  declare neighborhoodId: number

  @column()
  declare userId: number

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

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Computed */

  /* Relationships */
  @belongsTo(() => Neighborhood)
  declare neighborhood: BelongsTo<typeof Neighborhood>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /* Scopes */

  /* Lucid Properties */

  /* Lucid Methods */
}
