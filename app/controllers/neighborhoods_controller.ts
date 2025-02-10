import Neighborhood from '#models/neighborhood'
import NeighborhoodPolicy from '#policies/neighborhood_policy'
import ArrayUtil from '#utils/array'
import QueryUtil from '#utils/query'
import NeighborhoodValidator from '#validators/neighborhood'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class NeighborhoodsController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, request }: HttpContext) {
    await bouncer.with(NeighborhoodPolicy).authorize('readMany')

    const payload = await NeighborhoodValidator.index.validate(request.qs())

    return await Neighborhood.query()
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
          'admin.phoneNumbers',
          'admins.organizations',
        ]),
        (includeAdminsQuery) => {
          includeAdminsQuery.preload('admins', (preloadAdminsQuery) => {
            preloadAdminsQuery
              .if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'admins.*', 'admins.phoneNumbers']),
                (includePhoneNumbersQuery) => {
                  includePhoneNumbersQuery.preload('phoneNumbers')
                }
              )
              .if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  '*',
                  'admins.*',
                  'admins.organizations',
                ]),
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
        if (vine.helpers.isString(payload.searchBy) && payload.searchBy.length > 0) {
          searchQuery.whereILike(payload.searchBy as string, `%${payload.search!}%`)
        } else {
          searchQuery.where((searchWhereQuery) => {
            const columns = vine.helpers.isArray(payload.searchBy)
              ? payload.searchBy
              : NeighborhoodValidator.searchByOptions

            columns.forEach((column) => {
              searchWhereQuery.orWhereILike(column, `%${payload.search}%`)
            })
          })
        }
      })
      .where(QueryUtil.dateFilter(payload))
      .paginate(payload.page, payload.perPage)
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
  async show({ bouncer, params, request }: HttpContext) {
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
          'admins.*',
          'admins.phoneNumbers',
          'admins.organizations',
        ]),
        (includeAdminsQuery) => {
          includeAdminsQuery.preload('admins', (preloadAdminsQuery) => {
            preloadAdminsQuery
              .if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'admins.*', 'admins.phoneNumbers']),
                (includePhoneNumbersQuery) => {
                  includePhoneNumbersQuery.preload('phoneNumbers')
                }
              )
              .if(
                ArrayUtil.hasOrIsAnyFrom(payload.include, [
                  '*',
                  'admins.*',
                  'admins.organizations',
                ]),
                (includeOrganizationsQuery) => {
                  includeOrganizationsQuery.preload('organizations')
                }
              )
          })
        }
      )
      .where('id', params.id)
      .firstOrFail()

    return neighborhood
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request }: HttpContext) {
    await bouncer.with(NeighborhoodPolicy).authorize('edit', params.id)

    const payload = await NeighborhoodValidator.update(params.id).validate(request.body())

    const neighborhood = await Neighborhood.findOrFail(params.id)

    neighborhood.merge(payload)

    await neighborhood.save()

    await neighborhood.refresh()

    return neighborhood
  }
}
