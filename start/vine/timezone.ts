import { VineString } from '@vinejs/vine'
import { StringTimezoneOptions, stringTimezoneRule } from '#rules/timezone'

declare module '@vinejs/vine' {
  interface VineString {
    timezone(): this
  }
}

VineString.macro('timezone', function (this: VineString, options?: StringTimezoneOptions) {
  return this.use(stringTimezoneRule(options))
})
