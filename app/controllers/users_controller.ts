import AdminInvitation from '#models/admin_invitation'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ArrayUtil from '#utils/array'
import UserValidator from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
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

      // TODO: deactivate neighborhood invitations and delete neighborhood invitation tokens
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
    await bouncer.with(UserPolicy).authorize('readMany')

    const payload = await UserValidator.index.validate(request.qs())

    return User.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          UserValidator.countOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'adminedNeighborhoods']),
        (includeAdminedNeighborhoodsQuery) => {
          includeAdminedNeighborhoodsQuery.preload('adminedNeighborhoods')
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'locations',
          'locations.*',
          'locations.neighborhood',
        ]),
        (includeLocationsQuery) => {
          includeLocationsQuery.preload('locations', (preloadLocationsQuery) => {
            preloadLocationsQuery.if(
              ArrayUtil.hasOrIsAnyFrom(payload.include, [
                '*',
                'locations.*',
                'locations.neighborhood',
              ]),
              (includeNeighborhoodQuery) => {
                includeNeighborhoodQuery.preload('neighborhood')
              }
            )
          })
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'organizationLocations',
          'organizationLocations.*',
          'organizationLocations.neighborhood',
        ]),
        (includeOrganizationLocationsQuery) => {
          includeOrganizationLocationsQuery.preload(
            'organizationLocations',
            (preloadOrganizationLocationsQuery) => {
              preloadOrganizationLocationsQuery.if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  '*',
                  'organizationLocations.*',
                  'organizationLocations.neighborhood',
                ]),
                (includeNeighborhoodQuery) => {
                  includeNeighborhoodQuery.preload('neighborhood')
                }
              )
            }
          )
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'organizations']),
        (includeOrganizationsQuery) => {
          includeOrganizationsQuery.preload('organizations')
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'phoneNumbers']),
        (includePhoneNumbersQuery) => {
          includePhoneNumbersQuery.preload('phoneNumbers')
        }
      )
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
      .if(ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'sponsor']), (includeSponsorQuery) => {
        includeSponsorQuery.preload('sponsor')
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'sponsoredUsers']),
        (includeSponsoredUsersQuery) => {
          includeSponsoredUsersQuery.preload('sponsoredUsers')
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
      .if(payload.organizationId, (organizationIdQuery) => {
        organizationIdQuery.withScopes((scopes) => {
          scopes.existsWithOrganization(payload.organizationId!)
        })
      })
      .if(payload.organizationLocationId, (organizationLocationIdQuery) => {
        organizationLocationIdQuery.withScopes((scopes) => {
          scopes.existsWithOrganizationLocation(payload.organizationLocationId!)
        })
      })
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
      .paginate(payload.page, payload.perPage)
  }

  async show({ auth, bouncer, params, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('read')

    const payload = await UserValidator.show.validate(request.qs())

    const canSeeApplicationAdminInvitations =
      auth.user!.isApplicationAdmin || auth.user!.id === params.id

    return User.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          UserValidator.countOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['adminedNeighborhoods', '*']),
        (includeAdminedNeighborhoodsQuery) => {
          includeAdminedNeighborhoodsQuery.preload('adminedNeighborhoods')
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'locations',
          'locations.*',
          'locations.neighborhood',
        ]),
        (includeLocationsQuery) => {
          includeLocationsQuery.preload('locations', (locationsQuery) => {
            locationsQuery.if(
              ArrayUtil.hasOrIsAnyFrom(payload.include, [
                '*',
                'locations.*',
                'locations.neighborhood',
              ]),
              (includeNeighborhoodQuery) => {
                includeNeighborhoodQuery.preload('neighborhood')
              }
            )
          })
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'organizationLocations',
          'organizationLocations.*',
          'organizationLocations.neighborhood',
        ]),
        (includeOrganizationLocationsQuery) => {
          includeOrganizationLocationsQuery.preload(
            'organizationLocations',
            (organizationLocationsQuery) => {
              organizationLocationsQuery.if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  '*',
                  'organizationLocations.*',
                  'organizationLocations.neighborhood',
                ]),
                (includeNeighborhoodQuery) => {
                  includeNeighborhoodQuery.preload('neighborhood')
                }
              )
            }
          )
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['organizations', '*']),
        (includeOrganizationsQuery) => {
          includeOrganizationsQuery.preload('organizations')
        }
      )
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
      .if(ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'sponsor']), (includeSponsorQuery) => {
        includeSponsorQuery.preload('sponsor')
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'sponsoredUsers']),
        (includeSponsoredUsersQuery) => {
          includeSponsoredUsersQuery.preload('sponsoredUsers')
        }
      )
      .where('id', params.id)
      .firstOrFail()
  }

  async update({ bouncer, params, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('edit', params.id)

    const user = await User.findOrFail(params.id)

    const payload = await UserValidator.update.validate(request.body())

    user.merge(payload)

    await user.save()

    await user.refresh()

    return user
  }
}
