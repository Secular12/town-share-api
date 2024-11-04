import User from '#models/user'
import UserPolicy from '#policies/user_policy'
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
      .select('users.*')
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          UserValidator.countAndIncludeOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['locations', '*']),
        (includeLocationsQuery) => {
          includeLocationsQuery.preload('locations')
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['organizationLocations', '*']),
        (includeOrganizationLocationsQuery) => {
          includeOrganizationLocationsQuery.preload('organizationLocations')
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
        locations: UserLocationSerializer,
        organizationLocations: OrganizationLocationSerializer,
        organizations: OrganizationSerializer,
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
    const payload = await UserValidator.show.validate(request.qs())

    const user = await User.query()
      .if((payload.count?.length ?? 0) > 0, (countQuery) => {
        if (vine.helpers.isArray(payload.count)) {
          payload.count!.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else if (payload.count === '*') {
          UserValidator.countAndIncludeOptions.forEach((countBy) => {
            countQuery.withCount(countBy)
          })
        } else {
          countQuery.withCount(payload.count!)
        }
      })
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['locations', '*']),
        (includeLocationsQuery) => {
          includeLocationsQuery.preload('locations')
        }
      )
      .if(
        ArrayUtil.hasOrIsAnyFrom(payload.include, ['organizationLocations', '*']),
        (includeOrganizationLocationsQuery) => {
          includeOrganizationLocationsQuery.preload('organizationLocations')
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

    await bouncer.with(UserPolicy).authorize('read', user)

    return UserSerializer.serialize(user, {
      authUser: auth.user,
      relatedSerializers: {
        locations: UserLocationSerializer,
        organizationLocations: OrganizationLocationSerializer,
        organizations: OrganizationSerializer,
      },
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, bouncer, params, request }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('edit', user)

    const payload = await UserValidator.update.validate(request.body())

    await bouncer.with(UserPolicy).authorize('editIsApplicationAdmin', payload)

    user.merge(payload)

    await user.save()

    await user.refresh()

    return UserSerializer.serialize(user, { authUser: auth.user })
  }
}
