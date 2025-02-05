import { VineString } from '@vinejs/vine'
import { StringNumericOptions, stringNumericRule } from '#rules/numeric'

declare module '@vinejs/vine' {
  interface VineString {
    numeric(options?: StringNumericOptions): this
  }
}

VineString.macro('numeric', function (this: VineString, options?: StringNumericOptions) {
  return this.use(stringNumericRule(options))
})
