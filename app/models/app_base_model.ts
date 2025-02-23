import ArrayUtil from '#utils/array'
import { BaseModel, scope } from '@adonisjs/lucid/orm'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

type IncludePreloadGroup = {
  preload: string
  includes: string[]
  children: IncludePreloadGroup[]
}

export const getIncludePreloadGroups = <const T extends readonly string[]>(
  preloadOptions: T,
  prefix: string = '',
  includePreloadGroups: IncludePreloadGroup[] = [],
  i: number = 0
): IncludePreloadGroup[] => {
  if (i >= preloadOptions.length) return includePreloadGroups

  const preloadOption = preloadOptions[i]

  const preloadSplit = preloadOption.split('.')

  const includeSplit = `${prefix}${preloadOption}`.split('.')

  const rootPreload = preloadSplit[0]

  const matchingGroupIndex = includePreloadGroups.findIndex(
    (includePreloadGroup) => includePreloadGroup.preload === rootPreload
  )

  const wildCards = includeSplit.reduce((wildCardAcc: string[], _, preloadSplitIndex) => {
    const wildCard =
      preloadSplitIndex === 0 ? '*' : `${includeSplit.slice(0, preloadSplitIndex).join('.')}.*`

    wildCardAcc.push(wildCard)

    return wildCardAcc
  }, [])

  if (matchingGroupIndex === -1) {
    return getIncludePreloadGroups(
      preloadOptions,
      prefix,
      [
        ...includePreloadGroups,
        {
          preload: rootPreload,
          includes: [...wildCards, `${prefix}${preloadOption}`],
          children:
            preloadSplit.length > 1
              ? getIncludePreloadGroups(
                  [preloadSplit.slice(1, preloadSplit.length).join('.')],
                  `${prefix}${preloadSplit.slice(0, 1).join('.')}.`
                )
              : [],
        },
      ],
      i + 1
    )
  }

  includePreloadGroups[matchingGroupIndex].includes = [
    ...new Set([
      ...includePreloadGroups[matchingGroupIndex].includes,
      ...wildCards,
      `${prefix}${preloadOption}`,
    ]),
  ]

  if (preloadSplit.length > 1) {
    includePreloadGroups[matchingGroupIndex].children = getIncludePreloadGroups(
      [preloadSplit.slice(1, preloadSplit.length).join('.')],
      `${prefix}${preloadSplit.slice(0, 1).join('.')}.`,
      includePreloadGroups[matchingGroupIndex].children
    )
  }

  return getIncludePreloadGroups(preloadOptions, prefix, includePreloadGroups, i + 1)
}

const preloadIncludes = (
  query: any,
  payload: { include?: string | string[] },
  includePreloadGroups: IncludePreloadGroup[]
) => {
  if (!payload.include) return

  includePreloadGroups.forEach((includePreloadGroup) => {
    query.if(
      ArrayUtil.hasOrIsAnyFrom(payload.include, includePreloadGroup.includes),
      (includeQuery: any) => {
        includeQuery.preload(includePreloadGroup.preload, (preloadQuery: any) => {
          preloadQuery.if(includePreloadGroup.children.length > 0, (childrenQuery: any) => {
            preloadIncludes(childrenQuery, payload, includePreloadGroup.children)
          })
        })
      }
    )
  })
}

export default class AppBaseModel extends BaseModel {
  /* Scopes */
  static include = scope(
    (
      query: ModelQueryBuilderContract<LucidModel, LucidRow>,
      payload: { include?: string | string[] },
      preloadOptions: readonly string[]
    ) => {
      preloadIncludes(query, payload, getIncludePreloadGroups(preloadOptions))
    }
  )
}
