import User from '#models/user'
import * as AuthenticalValidator from '#validators/authentication'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthenticationController {
  async login({ auth, request }: HttpContext) {
    const payload = await AuthenticalValidator.loginValidator.validate(request.body())

    const user = await User.verifyCredentials(payload.email, payload.password)

    return auth.use('web').login(user)
  }

  async logout({ auth }: HttpContext) {
    return auth.use('web').logout()
  }
}
