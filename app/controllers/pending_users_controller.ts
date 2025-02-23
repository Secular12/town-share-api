import PendingUser from '#models/pending_user'
import PendingUserPolicy from '#policies/pending_user_policy'
import QueryUtil from '#utils/query'
import PendingUserValidator from '#validators/pending_user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class PendingUsersController {
  async index({ bouncer, request }: HttpContext) {
    const payload = await PendingUserValidator.index.validate(request.qs())

    await bouncer.with(PendingUserPolicy).authorize('readMany')

    return PendingUser.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            if (countBy !== '*') {
              countQuery.withCount(countBy)
            }
          })
        } else if (payload.count === '*') {
          PendingUserValidator.countOptions.forEach((countBy) => {
            if (countBy !== '*') {
              countQuery.withCount(countBy)
            }
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .withScopes((scopes) => scopes.include(payload, PendingUserValidator.preloadOptions))
      .where(QueryUtil.dateFilter(payload))
      .paginate(payload.page, payload.perPage)
  }

  async show({ bouncer, params, request }: HttpContext) {
    const payload = await PendingUserValidator.show.validate(request.qs())

    await bouncer.with(PendingUserPolicy).authorize('read')

    return PendingUser.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            if (countBy !== '*') {
              countQuery.withCount(countBy)
            }
          })
        } else if (payload.count === '*') {
          PendingUserValidator.countOptions.forEach((countBy) => {
            if (countBy !== '*') {
              countQuery.withCount(countBy)
            }
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .withScopes((scopes) => scopes.include(payload, PendingUserValidator.preloadOptions))
      .where('id', params.id)
      .firstOrFail()
  }
}
