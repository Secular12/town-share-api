import stringHelpers from '@adonisjs/core/helpers/string'

export const wait = (prettyTime: string) =>
  new Promise((resolve) => setTimeout(resolve, stringHelpers.milliseconds.parse(prettyTime)))
