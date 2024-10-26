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
import type { CrudTag, RouteGroupTag } from '#types/test_tags'

declare module '@japa/runner/core' {
  interface Test {
    tagBadRequest(): this
    tagCrud(crudTags: CrudTag | CrudTag[]): this
    tagRouteGroup(authorizationTags: RouteGroupTag | RouteGroupTag[]): this
    tagSuccess(): this
    tagUnauthorized(): this
  }
}

Test.macro('tagBadRequest', function (this: Test) {
  this.tags(['@error', '@clientError', '@badRequest'], 'append')
  return this
})

Test.macro('tagCrud', function (this: Test, crudTags: CrudTag | CrudTag[]) {
  const tags = Array.isArray(crudTags) ? crudTags : [crudTags]
  this.tags(['@crud', ...tags], 'append')
  return this
})

Test.macro('tagRouteGroup', function (this: Test, routeGroupTags: RouteGroupTag | RouteGroupTag[]) {
  const tags = Array.isArray(routeGroupTags) ? routeGroupTags : [routeGroupTags]
  this.tags(['@routeGroup', ...tags], 'append')
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
