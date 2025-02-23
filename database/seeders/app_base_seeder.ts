import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ObjectUtil from '#utils/object'
import { JsObject } from '#types/object'

export default class AppBaseSeeder extends BaseSeeder {
  static mapData<T>(data: T[], cb: (item: T, itemIndex: number) => JsObject) {
    return data.map((item, itemIndex) => {
      return ObjectUtil.filter(cb(item, itemIndex), (value) => value !== undefined)
    })
  }

  static getItems<T extends { data: JsObject }>(data: T[]) {
    return this.mapData(data, (dataItem) => dataItem.data)
  }
}
