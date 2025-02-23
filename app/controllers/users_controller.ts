import ReactivateUserNotification from '#mails/reactivate_user_notification'
import AdminInvitation from '#models/admin_invitation'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ArrayUtil from '#utils/array'
import QueryUtil from '#utils/query'
import UserValidator from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class UsersController {
  async deactivate({ bouncer, params }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('deactivate')

    const dateTimeNow = DateTime.utc()

    const user = await User.findOrFail(params.id)

    user.deactivatedAt = dateTimeNow

    return db.transaction(async (trx) => {
      user.useTransaction(trx)

      await user.save()

      const receivedAdminInvitations = await user
        .related('receivedAdminInvitations')
        .query()
        .withScopes((scopes) => scopes.isPending())
        .where('userId', params.id)

      for await (const adminInvitation of receivedAdminInvitations) {
        const receivedAdminInvitationsTokens =
          await AdminInvitation.adminInvitationTokens.all(adminInvitation)

        for await (const token of receivedAdminInvitationsTokens) {
          await AdminInvitation.adminInvitationTokens.delete(adminInvitation, token.identifier)
        }
      }

      const adminInvitations = receivedAdminInvitations.map(({ id }: { id: number }) => ({
        id,
        revokedAt: dateTimeNow,
      }))

      await AdminInvitation.updateOrCreateMany('id', adminInvitations)

      const receivedNeighborhoodAdminInvitations = await user
        .related('receivedNeighborhoodAdminInvitations')
        .query()
        .withScopes((scopes) => scopes.isPending())
        .where('userId', params.id)

      for await (const neighborhoodAdminInvitation of receivedNeighborhoodAdminInvitations) {
        const receivedAdminInvitationsTokens =
          await NeighborhoodAdminInvitation.adminInvitationTokens.all(neighborhoodAdminInvitation)

        for await (const token of receivedAdminInvitationsTokens) {
          await NeighborhoodAdminInvitation.adminInvitationTokens.delete(
            neighborhoodAdminInvitation,
            token.identifier
          )
        }
      }

      const neighborhoodAdminInvitations = receivedNeighborhoodAdminInvitations.map(
        ({ id }: { id: number }) => ({
          id,
          revokedAt: dateTimeNow,
        })
      )

      await NeighborhoodAdminInvitation.updateOrCreateMany('id', neighborhoodAdminInvitations)

      await user.refresh()

      return user
    })
  }

  async demoteAdmin({ bouncer, params, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('demoteAdmin')

    const user = await User.findOrFail(params.id)

    if (!user.isApplicationAdmin) {
      return response.badRequest({
        errors: [{ message: 'This user is not an application admin' }],
      })
    }

    user.isApplicationAdmin = false

    await user.save()

    await user.refresh()

    return user
  }

  async index({ auth, bouncer, request }: HttpContext) {
    const payload = await UserValidator.index.validate(request.qs())

    await bouncer.with(UserPolicy).authorize('readMany')

    return (
      User.query()
        .if((payload.count?.length ?? 0) > 0, (countQuery) => {
          if (vine.helpers.isArray(payload.count)) {
            payload.count!.forEach((countBy) => {
              if (countBy !== '*') {
                countQuery.withCount(countBy)
              }
            })
          } else if (payload.count === '*') {
            UserValidator.countOptions.forEach((countBy) => {
              if (countBy !== '*') {
                countQuery.withCount(countBy)
              }
            })
          } else {
            countQuery.withCount(payload.count!)
          }
        })
        .withScopes((scopes) => scopes.include(payload, UserValidator.preloadOptions))
        .if(
          auth.user!.isApplicationAdmin &&
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
        .if(
          auth.user!.isApplicationAdmin &&
            ArrayUtil.hasOrIsAnyFrom(payload.include, [
              '*',
              'sentAdminInvitations',
              'sentAdminInvitations.*',
              'sentAdminInvitations.pendingUser',
              'sentAdminInvitations.user',
            ]),
          (includeSentAdminInvitations) => {
            includeSentAdminInvitations.preload(
              'sentAdminInvitations',
              (preloadSentAdminInvitationsQuery) => {
                preloadSentAdminInvitationsQuery
                  .if(
                    ArrayUtil.hasOrIsAnyFrom(payload.include, [
                      '*',
                      'sentAdminInvitations.*',
                      'sendAdminInvitations.pendingUser',
                    ]),
                    (preloadPendingUserQuery) => {
                      preloadPendingUserQuery.preload('pendingUser')
                    }
                  )
                  .if(
                    ArrayUtil.hasOrIsAnyFrom(payload.include, [
                      '*',
                      'sentAdminInvitations.*',
                      'sentAdminInvitations.user',
                    ]),
                    (preloadUserQuery) => {
                      preloadUserQuery.preload('user')
                    }
                  )
              }
            )
          }
        )
        .if(payload.isActive === true, (isActiveQuery) => {
          isActiveQuery.withScopes((scopes) => scopes.isActive())
        })
        .if(payload.isActive === false, (isNotActiveQuery) => {
          isNotActiveQuery.withScopes((scopes) => scopes.isNotActive())
        })
        .if(
          payload.isApplicationAdmin! === true || payload.isApplicationAdmin === false,
          (isApplicationAdminQuery) => {
            isApplicationAdminQuery.where('isApplicationAdmin', payload.isApplicationAdmin!)
          }
        )
        .if(payload.neighborhoodId, (neighborhoodIdQuery) => {
          neighborhoodIdQuery.withScopes((scopes) =>
            scopes.existsWithNeighborhood(payload.neighborhoodId!)
          )
        })
        // .if(payload.organizationId, (organizationIdQuery) => {
        //   organizationIdQuery.withScopes((scopes) => {
        //     scopes.existsWithOrganization(payload.organizationId!)
        //   })
        // })
        // .if(payload.organizationLocationId, (organizationLocationIdQuery) => {
        //   organizationLocationIdQuery.withScopes((scopes) => {
        //     scopes.existsWithOrganizationLocation(payload.organizationLocationId!)
        //   })
        // })
        .if(payload.sponsorId, (sponsorIdQuery) => {
          sponsorIdQuery.where('sponsorId', payload.sponsorId!)
        })
        .if(payload.orderBy, (orderByQuery) => {
          orderByQuery.orderBy(ArrayUtil.orderBy(payload.orderBy!))
        })
        .if(payload.search, (searchQuery) => {
          searchQuery.withScopes((scopes) => {
            scopes.search(payload)
          })
        })
        .where(QueryUtil.dateFilter(payload))
        .paginate(payload.page, payload.perPage)
    )
  }

  async reactivate({ bouncer, params, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('reactivate')

    const user = await User.findOrFail(params.id)

    if (user.isActive) {
      return response.badRequest({
        errors: [{ message: 'This user is already active.' }],
      })
    }

    user.deactivatedAt = null

    await user.save()

    await mail.send(new ReactivateUserNotification({ recipients: { to: user.email }, user }))

    await user.refresh()

    return user
  }

  async show({ auth, bouncer, params, request }: HttpContext) {
    const payload = await UserValidator.show.validate(request.qs())

    await bouncer.with(UserPolicy).authorize('read')

    const canSeeApplicationAdminInvitations =
      auth.user!.isApplicationAdmin || auth.user!.id === params.id

    return User.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            if (countBy !== '*') {
              countQuery.withCount(countBy)
            }
          })
        } else if (payload.count === '*') {
          UserValidator.countOptions.forEach((countBy) => {
            if (countBy !== '*') {
              countQuery.withCount(countBy)
            }
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .withScopes((scopes) => scopes.include(payload, UserValidator.preloadOptions))
      .if(
        canSeeApplicationAdminInvitations &&
          ArrayUtil.hasOrIsAnyFrom(payload.include, [
            '*',
            'receivedAdminInvitations',
            'receivedAdminInvitations.*',
            'receivedAdminInvitations.inviter',
          ]),
        (inclueReceivedAdminInvitationQuery) => {
          inclueReceivedAdminInvitationQuery.preload(
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
      .if(
        canSeeApplicationAdminInvitations &&
          ArrayUtil.hasOrIsAnyFrom(payload.include, [
            '*',
            'sentAdminInvitations',
            'sentAdminInvitations.*',
            'sentAdminInvitations.pendingUser',
            'sentAdminInvitations.user',
          ]),
        (includeSentAdminInvitations) => {
          includeSentAdminInvitations.preload(
            'sentAdminInvitations',
            (preloadSentAdminInvitationsQuery) => {
              preloadSentAdminInvitationsQuery
                .if(
                  ArrayUtil.hasOrIsAnyFrom(payload.include, [
                    '*',
                    'sentAdminInvitations.*',
                    'sendAdminInvitations.pendingUser',
                  ]),
                  (preloadPendingUserQuery) => {
                    preloadPendingUserQuery.preload('pendingUser')
                  }
                )
                .if(
                  ArrayUtil.hasOrIsAnyFrom(payload.include, [
                    '*',
                    'sentAdminInvitations.*',
                    'sentAdminInvitations.user',
                  ]),
                  (preloadUserQuery) => {
                    preloadUserQuery.preload('user')
                  }
                )
            }
          )
        }
      )
      .where('id', params.id)
      .firstOrFail()
  }

  async update({ bouncer, params, request }: HttpContext) {
    const payload = await UserValidator.update.validate(request.body())

    await bouncer.with(UserPolicy).authorize('edit', params.id)

    const user = await User.findOrFail(params.id)

    user.merge(payload)

    await user.save()

    await user.refresh()

    return user
  }
}
