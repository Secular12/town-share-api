/*
|--------------------------------------------------------------------------
| Test runner entrypoint
|--------------------------------------------------------------------------
|
| The "test.ts" file is the entrypoint for running tests using Japa.
|
| Either you can run this file directly or use the "test"
| command to run this file and monitor file changes.
|
*/

process.env.NODE_ENV = 'test'

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'
import { configure, processCLIArgs, run } from '@japa/runner'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .testRunner()
  .configure(async (app) => {
    const { runnerHooks, ...config } = await import('../tests/bootstrap.js')

    processCLIArgs(process.argv.splice(2))
    configure({
      ...app.rcFile.tests,
      ...config,
      ...{
        setup: runnerHooks.setup,
        teardown: runnerHooks.teardown.concat([() => app.terminate()]),
      },
    })
  })
  .run(() => run())
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })

import { Test } from '@japa/runner/core'
import type { CrudTag, ResourceTag } from '#types/test_tags'

declare module '@japa/runner/core' {
  interface Test {
    tagBadRequest(): this
    tagCrud(crudTags: CrudTag): this
    tagCrudResource(tags: [CrudTag, ResourceTag | ResourceTag[]][]): this
    tagEmail(): this
    tagForbidden(): this
    tagResource(resourceTags: ResourceTag | ResourceTag[]): this
    tagSuccess(): this
    tagUnauthorized(): this
    tagUnprocessableEntity(): this
  }
}

Test.macro('tagBadRequest', function (this: Test) {
  this.tags(['@error', '@clientError', '@badRequest'], 'append')
  return this
})

Test.macro('tagCrud', function (this: Test, crudTag: CrudTag) {
  this.tags(['@crud', crudTag], 'append')
  return this
})

Test.macro('tagEmail', function (this: Test) {
  this.tags(['@email'], 'append')
  return this
})

Test.macro('tagForbidden', function (this: Test) {
  this.tags(['@error', '@clientError', '@forbidden'], 'append')
  return this
})

Test.macro('tagResource', function (this: Test, resourceTags: ResourceTag | ResourceTag[]) {
  const tags = Array.isArray(resourceTags) ? resourceTags : [resourceTags]
  this.tags(['@model', ...tags], 'append')
  return this
})

Test.macro('tagSuccess', function (this: Test) {
  this.tags(['@success'], 'append')
  return this
})

Test.macro('tagUnauthorized', function (this: Test) {
  this.tags(['@error', '@clientError', '@unauthorized'], 'append')
  return this
})

Test.macro('tagUnprocessableEntity', function (this: Test) {
  this.tags(['@error', '@clientError', '@unprocessableEntity'], 'append')
  return this
})
