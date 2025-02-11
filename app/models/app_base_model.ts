import { BaseModel, scope } from '@adonisjs/lucid/orm'
import ArrayUtil from '#utils/array'

// TODO: Finish this!
const getIncludeGroups = (includeOptions: string[], hasWildCard?: boolean) => {
  return includeOptions.reduce((groups: Record<string, any>, includeOption) => {
    if (includeOption === '*') return groups
    const splitGroup = includeOption.split('.')
    const parentGroup = splitGroup[0]
    if (splitGroup.length < 3) {
      groups[parentGroup] = {
        children: [],
        includes: [
          ...(groups[parentGroup]?.includes ??
            ((hasWildCard ?? includeOptions.includes('*')) ? ['*'] : [])),
          includeOption,
        ],
      }
    } else {
      groups[parentGroup] = {
        children: [],
        includes: [
          ...(groups[parentGroup]?.includes ??
            ((hasWildCard ?? includeOptions.includes('*')) ? ['*'] : [])),
          includeOption,
        ],
      }
    }

    return groups
  }, {})
}

export default class AppBaseModel extends BaseModel {
  /* Scopes */
  static include = scope((query, payload: { include: string[] }, includeOptions: string[]) => {
    const hasWildcard = includeOptions.includes('*')
    const includeGroups = includeOptions.forEach((includeOption) => {
      ArrayUtil.hasOrIsAnyFrom(payload.include, includeOptions)
    })
  })
}
