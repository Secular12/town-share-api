import {
  UniqueObjectOptions,
  UniqueStringOptions,
  uniqueObjectRule,
  uniqueStringRule,
} from '#rules/unique'
import { VineObject, VineString } from '@vinejs/vine'
import { SchemaTypes } from '@vinejs/vine/types'

declare module '@vinejs/vine' {
  interface VineObject<
    Properties extends Record<string, SchemaTypes>,
    Input,
    Output,
    CamelCaseOutput,
  > {
    unique(options: UniqueObjectOptions): this
  }

  interface VineString {
    unique(options: UniqueStringOptions): this
  }
}

VineObject.macro(
  'unique',
  function (this: VineObject<any, any, any, any>, options: UniqueObjectOptions) {
    return this.use(uniqueObjectRule(options))
  }
)

VineString.macro('unique', function (this: VineString, options: UniqueStringOptions) {
  return this.use(uniqueStringRule(options))
})
