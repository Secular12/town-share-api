import PendingUser from '#models/pending_user'
import PendingUserPolicy from '#policies/pending_user_policy'
import ArrayUtil from '#utils/array'
import QueryUtil from '#utils/query'
import PendingUserValidator from '#validators/pending_user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class PendingUsersController {
  async index({ bouncer, request }: HttpContext) {
    await bouncer.with(PendingUserPolicy).authorize('readMany')

    const payload = await PendingUserValidator.index.validate(request.qs())

    return PendingUser.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          PendingUserValidator.countOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'receivedAdminInvitations',
          'receivedAdminInvitations.*',
          'receivedAdminInvitations.inviter',
        ]),
        (includeReceivedAdminInvitationQuery) => {
          includeReceivedAdminInvitationQuery.preload(
            'receivedAdminInvitations',
            (preloadReceivedAdminInvitationQuery) => {
              preloadReceivedAdminInvitationQuery.if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  '*',
                  'receivedAdminInvitations.*',
                  'receivedAdminInvitations.inviter',
                ]),
                (includeInviterQuery) => {
                  includeInviterQuery.preload('inviter')
                }
              )
            }
          )
        }
      )
      .where(QueryUtil.dateFilter(payload))
      .paginate(payload.page, payload.perPage)
  }

  async show({ bouncer, params, request }: HttpContext) {
    await bouncer.with(PendingUserPolicy).authorize('read')

    const payload = await PendingUserValidator.show.validate(request.qs())

    return PendingUser.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          PendingUserValidator.countOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'receivedAdminInvitations',
          'receivedAdminInvitations.*',
          'receivedAdminInvitations.inviter',
        ]),
        (includeReceivedAdminInvitationQuery) => {
          includeReceivedAdminInvitationQuery.preload(
            'receivedAdminInvitations',
            (preloadReceivedAdminInvitationQuery) => {
              preloadReceivedAdminInvitationQuery.if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  '*',
                  'receivedAdminInvitations.*',
                  'receivedAdminInvitations.inviter',
                ]),
                (includeInviterQuery) => {
                  includeInviterQuery.preload('inviter')
                }
              )
            }
          )
        }
      )
      .where('id', params.id)
      .firstOrFail()
  }
}
