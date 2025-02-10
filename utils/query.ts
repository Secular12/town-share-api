import ObjectUtils from '#utils/object'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

type DateFilterData = {
  afterE?: Record<string, DateTime>
  afterI?: Record<string, DateTime>
  beforeE?: Record<string, DateTime>
  beforeI?: Record<string, DateTime>
}

const dateFilter =
  (data: DateFilterData) =>
  <T extends ModelQueryBuilder>(query: T) => {
    query
      .if(!ObjectUtils.isEmpty(data.afterE), (afterEQuery) => {
        ObjectUtils.forEach(data.afterE!, (value, column) => {
          afterEQuery.where(column, '>', value)
        })
      })
      .if(!ObjectUtils.isEmpty(data.afterI), (afterIQuery) => {
        ObjectUtils.forEach(data.afterI!, (value, column) => {
          afterIQuery.where(column, '>=', value)
        })
      })
      .if(!ObjectUtils.isEmpty(data.beforeE), (beforeEQuery) => {
        ObjectUtils.forEach(data.beforeE!, (value, column) => {
          beforeEQuery.where(column, '<', value)
        })
      })
      .if(!ObjectUtils.isEmpty(data.beforeI), (beforeIQuery) => {
        ObjectUtils.forEach(data.beforeI!, (value, column) => {
          beforeIQuery.where(column, '<=', value)
        })
      })
  }

export default {
  dateFilter,
}
