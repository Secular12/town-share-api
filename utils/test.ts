import User from '#models/user'
import { ApiRequest } from '@japa/api-client'

export const conditionalLoginAsRequest = async (request: ApiRequest, authUserId?: number) => {
  const user = authUserId ? await User.findOrFail(authUserId) : null
  return user ? request.loginAs(user) : request
}
