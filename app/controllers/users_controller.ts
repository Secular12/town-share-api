import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import NeighborhoodSerializer from '#serializers/neighborhood_serializer'
import OrganizationLocationSerializer from '#serializers/organization_location_serializer'
import OrganizationSerializer from '#serializers/organization_serializer'
import UserLocationSerializer from '#serializers/user_location_serializer'
import UserSerializer from '#serializers/user_serializer'
import * as ArrayUtil from '#utils/array'
import * as UserValidator from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ auth, bouncer, request }: HttpContext) {
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
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['adminedNeighborhoods', '*']),
        (includeAdminedNeighborhoodsQuery) => {
          includeAdminedNeighborhoodsQuery.preload('adminedNeighborhoods')
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['locations', 'locations.neighborhood', '*']),
        (includeLocationsQuery) => {
          includeLocationsQuery.preload('locations', (preloadLocationsQuery) => {
            preloadLocationsQuery.if(
              ArrayUtil.hasOrIsAnyFrom(payload.include, ['locations.neighborhood', '*']),
              (includeNeighborhoodQuery) => {
                includeNeighborhoodQuery.preload('neighborhood')
              }
            )
          })
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          'organizationLocations',
          'organizationLocations.neighborhood',
          '*',
        ]),
        (includeOrganizationLocationsQuery) => {
          includeOrganizationLocationsQuery.preload(
            'organizationLocations',
            (preloadOrganizationLocationsQuery) => {
              preloadOrganizationLocationsQuery.if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  'organizationLocations.neighborhood',
                  '*',
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
      .if(payload.orderBy, (orderByQuery) => {
        orderByQuery.orderBy(ArrayUtil.orderBy(payload.orderBy!))
      })
      .if(payload.search, (searchQuery) => {
        searchQuery.where((whereQuery) => {
          whereQuery
            .whereILike('email', `%${payload.search!}%`)
            .orWhereRaw(
              `CONCAT_WS(' ', first_name, middle_name, last_name, name_suffix) ILIKE '%${payload.search}%'`
            )
            .orWhereRaw(`CONCAT_WS(' ', first_name, last_name) ILIKE '%${payload.search}%'`)
        })
      })
      .paginate(payload.page, payload.perPage)

    return UserSerializer.serialize(users, {
      authUser: auth.user,
      relatedSerializers: {
        'adminedNeighborhoods': NeighborhoodSerializer,
        'locations': UserLocationSerializer,
        'locations.neighborhood': NeighborhoodSerializer,
        'organizationLocations': OrganizationLocationSerializer,
        'organizationLocations.neighborhood': NeighborhoodSerializer,
        'organizations': OrganizationSerializer,
      },
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')
    response.notImplemented()
  }

  /**
   * Show individual record
   */
  async show({ auth, bouncer, params, request }: HttpContext) {
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
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['locations', 'locations.neighborhood', '*']),
        (includeLocationsQuery) => {
          includeLocationsQuery.preload('locations', (locationsQuery) => {
            locationsQuery.if(
              ArrayUtil.hasOrIsAnyFrom(payload.include, ['locations.neighborhood', '*']),
              (includeNeighborhoodQuery) => {
                includeNeighborhoodQuery.preload('neighborhood')
              }
            )
          })
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          'organizationLocations',
          'organizationLocations.neighborhood',
          '*',
        ]),
        (includeOrganizationLocationsQuery) => {
          includeOrganizationLocationsQuery.preload(
            'organizationLocations',
            (organizationLocationsQuery) => {
              organizationLocationsQuery.if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  'organizationLocations.neighborhood',
                  '*',
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
      .where('id', params.id)
      .firstOrFail()

    return UserSerializer.serialize(user, {
      authUser: auth.user,
      relatedSerializers: {
        'adminedNeighborhoods': NeighborhoodSerializer,
        'locations': UserLocationSerializer,
        'locations.neighborhood': NeighborhoodSerializer,
        'organizationLocations': OrganizationLocationSerializer,
        'organizationLocations.neighborhood': NeighborhoodSerializer,
        'organizations': OrganizationSerializer,
      },
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, bouncer, params, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('edit', params.id)

    const user = await User.findOrFail(params.id)

    const payload = await UserValidator.update.validate(request.body())

    await bouncer.with(UserPolicy).authorize('editIsApplicationAdmin', payload)

    user.merge(payload)

    await user.save()

    await user.refresh()

    return UserSerializer.serialize(user, { authUser: auth.user })
  }
}
