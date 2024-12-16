import Neighborhood from '#models/neighborhood'
import NeighborhoodPolicy from '#policies/neighborhood_policy'
import NeighborhoodSerializer from '#serializers/neighborhood_serializer'
import OrganizationSerializer from '#serializers/organization_serializer'
import UserSerializer from '#serializers/user_serializer'
import * as ArrayUtil from '#utils/array'
import * as NeighborhoodValidator from '#validators/neighborhood'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class NeighborhoodsController {
  /**
   * Display a list of resource
   */
  async index({ auth, bouncer, request }: HttpContext) {
    await bouncer.with(NeighborhoodPolicy).authorize('readMany')

    const payload = await NeighborhoodValidator.index.validate(request.qs())

    const neighborhoods = await Neighborhood.query()
      .select('neighborhoods.*')
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          NeighborhoodValidator.countOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'admins',
          'admins.*',
          'admins.organizations',
        ]),
        (includeAdminsQuery) => {
          includeAdminsQuery.preload('admins', (preloadAdminsQuery) => {
            preloadAdminsQuery.if(
              ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'admins.*', 'admins.organizations']),
              (includeOrganizationsQuery) => {
                includeOrganizationsQuery.preload('organizations')
              }
            )
          })
        }
      )
      .if(payload.organizationId, (userIdQuery) => {
        userIdQuery.withScopes((scopes) => scopes.existsWithOrganization(payload.organizationId!))
      })
      .if(payload.userId, (userIdQuery) => {
        userIdQuery.withScopes((scopes) => scopes.existsWithUser(payload.userId!))
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
              searchWhereQuery.orWhereILike(column, `%${value}%`)
            })
          })
        } else {
          searchQuery.whereILike(payload.search!.column, `%${payload.search!.value}%`)
        }
      })
      .paginate(payload.page, payload.perPage)

    return NeighborhoodSerializer.serialize(neighborhoods, {
      authUser: auth.user,
      relatedSerializers: {
        'admins': UserSerializer,
        'admins.organizations': OrganizationSerializer,
      },
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, response }: HttpContext) {
    await bouncer.with(NeighborhoodPolicy).authorize('create')
    return response.notImplemented()
  }

  /**
   * Show individual record
   */
  async show({ auth, bouncer, params, request }: HttpContext) {
    await bouncer.with(NeighborhoodPolicy).authorize('read', params.id)

    const payload = await NeighborhoodValidator.show.validate(request.qs())

    const neighborhood = await Neighborhood.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          NeighborhoodValidator.countOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, [
          '*',
          'admins',
          'admin.*',
          'admins.organizations',
        ]),
        (includeAdminsQuery) => {
          includeAdminsQuery.preload('admins', (preloadAdminsQuery) => {
            preloadAdminsQuery.if(
              ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'admins.*', 'admins.organizations']),
              (includeOrganizationsQuery) => {
                includeOrganizationsQuery.preload('organizations')
              }
            )
          })
        }
      )
      .where('id', params.id)
      .firstOrFail()

    return NeighborhoodSerializer.serialize(neighborhood, {
      authUser: auth.user,
      relatedSerializers: {
        'admins': UserSerializer,
        'admins.organizations': OrganizationSerializer,
      },
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, response }: HttpContext) {
    await bouncer.with(NeighborhoodPolicy).authorize('edit', params.id)

    return response.notImplemented()
  }
}
