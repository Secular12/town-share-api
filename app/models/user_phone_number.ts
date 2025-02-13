import User from '#models/user'
import HelpersUtil from '#utils/helpers'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class UserPhoneNumber extends BaseModel {
  /* Primary IDs */
  @column({ isPrimary: true })
  declare id: number

  /* Relationship IDs */
  @column()
  declare userId: number

  /* Attributes */
  @column()
  declare countryCode: string

  @column()
  declare extension: string | null

  @column()
  declare phone: string

  /* Timestamps */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Computed */
  @computed()
  get formats() {
    return HelpersUtil.getPhoneFormats({
      countryCode: this.countryCode,
      phone: this.phone,
      extension: this.extension,
    })
  }

  /* Relationships */
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /* Scopes */

  /* Lucid Properties */

  /* Lucid Methods */
}
