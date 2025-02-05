import User from '#models/user'
import { ApiRequest } from '@japa/api-client'

const conditionalLoginAsRequest = async (request: ApiRequest, authUserId?: number) => {
  const user = authUserId ? await User.findOrFail(authUserId) : null
  return user ? request.loginAs(user) : request
}

const paginateSeedData = <T extends Record<string, any>>(
  seedData: T[],
  options?: {
    page?: number
    perPage?: number
  }
) => {
  const opts = {
    ...{
      page: 1,
      perPage: 100,
    },
    ...options,
  }

  const startIndex = opts.perPage * (opts.page - 1)
  const endIndex = opts.perPage * opts.page

  const data = seedData.slice(startIndex, endIndex)

  return data.map((item, itemIndex) => ({
    ...item,
    id: itemIndex + startIndex + 1,
  }))
}

export default {
  conditionalLoginAsRequest,
  paginateSeedData,
}
