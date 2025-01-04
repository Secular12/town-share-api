import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import ArrayUtil from '#utils/array'
import * as UserValidator from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('readMany')

    const payload = await UserValidator.index.validate(request.qs())

    const users = await User.query()
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
      .if(ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'sponsor']), (includeSponsorQuery) => {
        includeSponsorQuery.preload('sponsor')
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'sponsoredUsers']),
        (includeSponsoredUsersQuery) => {
          includeSponsoredUsersQuery.preload('sponsoredUsers')
        }
      )
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
        if (vine.helpers.isArray(payload.search)) {
          searchQuery.where((searchWhereQuery) => {
            // Just for type guarding
            if (!vine.helpers.isArray(payload.search)) return

            payload.search.forEach(({ column, value }) => {
              if (column === 'fullName') {
                searchWhereQuery.orWhereRaw(
                  `CONCAT_WS(' ', first_name, middle_name, last_name, name_suffix) ILIKE '%${value}%'`
                )
              } else if (column === 'name') {
                searchWhereQuery.orWhereRaw(
                  `CONCAT_WS(' ', first_name, last_name, name_suffix) ILIKE '%${value}%'`
                )
              } else {
                searchWhereQuery.orWhereILike(column, `%${value}%`)
              }
            })
          })
        } else {
          if (payload.search!.column === 'fullName') {
            searchQuery.orWhereRaw(
              `CONCAT_WS(' ', first_name, middle_name, last_name, name_suffix) ILIKE '%${payload.search!.value}%'`
            )
          } else if (payload.search!.column === 'name') {
            searchQuery.orWhereRaw(
              `CONCAT_WS(' ', first_name, last_name, name_suffix) ILIKE '%${payload.search!.value}%'`
            )
          } else {
            searchQuery.orWhereILike(payload.search!.column, `%${payload.search!.value}%`)
          }
        }
      })
      .paginate(payload.page, payload.perPage)

    return users
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')
    return response.notImplemented()
  }

  /**
   * Show individual record
   */
  async show({ bouncer, params, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('read', params.id)
    const payload = await UserValidator.show.validate(request.qs())

    const user = await User.query()
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

    return user
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('edit', params.id)

    const user = await User.findOrFail(params.id)

    const payload = await UserValidator.update.validate(request.body())

    await bouncer.with(UserPolicy).authorize('editIsApplicationAdmin', payload)

    user.merge(payload)

    await user.save()

    await user.refresh()

    return user
  }
}
