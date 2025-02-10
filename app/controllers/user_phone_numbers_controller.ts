import UserPhoneNumber from '#models/user_phone_number'
import UserPhoneNumberPolicy from '#policies/user_phone_number_policy'
import ArrayUtil from '#utils/array'
import QueryUtil from '#utils/query'
import UserPhoneNumberValidator from '#validators/user_phone_number'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserPhoneNumbersController {
  async destroy({ bouncer, params }: HttpContext) {
    const userPhoneNumber = await UserPhoneNumber.findOrFail(params.id)

    await bouncer.with(UserPhoneNumberPolicy).authorize('delete', userPhoneNumber)

    await userPhoneNumber.delete()
  }

  async index({ bouncer, request }: HttpContext) {
    const payload = await UserPhoneNumberValidator.index.validate(request.qs())

    await bouncer.with(UserPhoneNumberPolicy).authorize('readMany')

    return UserPhoneNumber.query()
      .if(payload.userId, (userIdQuery) => {
        userIdQuery.where('userId', payload.userId!)
      })
      .if(ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'user']), (includeUserQuery) => {
        includeUserQuery.preload('user')
      })
      .where(QueryUtil.dateFilter(payload))
      .paginate(payload.page, payload.perPage)
  }

  async show({ bouncer, params, request }: HttpContext) {
    const payload = await UserPhoneNumberValidator.show.validate(request.qs())

    const userPhoneNumber = await UserPhoneNumber.query()
      .if(ArrayUtil.hasOrIsAnyFrom(payload.include, ['*', 'user']), (includeUserQuery) => {
        includeUserQuery.preload('user')
      })
      .where('id', params.id)
      .firstOrFail()

    await bouncer.with(UserPhoneNumberPolicy).authorize('read', userPhoneNumber)

    return userPhoneNumber
  }

  async store({ bouncer, request }: HttpContext) {
    const payload = await UserPhoneNumberValidator.store.validate(request.body())

    await bouncer.with(UserPhoneNumberPolicy).authorize('create', payload.userId)

    const userPhoneNumber = await UserPhoneNumber.create(payload)

    await userPhoneNumber.refresh()

    return userPhoneNumber
  }

  async update({ bouncer, params, request }: HttpContext) {
    console.log(params)
    const userPhoneNumber = await UserPhoneNumber.findOrFail(params.id)

    await bouncer.with(UserPhoneNumberPolicy).authorize('update', userPhoneNumber)

    const payload = await UserPhoneNumberValidator.update.validate(request.body())

    userPhoneNumber.merge(payload)

    await userPhoneNumber.save()

    await userPhoneNumber.refresh()

    return userPhoneNumber
  }
}
