import UsersIndexCountTests from '#tests/functional/users/index/count'
import UsersIndexFilterTests from '#tests/functional/users/index/filter'
import UsersIndexIncludeTests from '#tests/functional/users/index/include'
import UsersIndexOrderByTests from '#tests/functional/users/index/order_by'
import UsersIndexPaginateTests from '#tests/functional/users/index/paginate'
import UsersIndexSearchTests from '#tests/functional/users/index/search'
import { test } from '@japa/runner'

const route = '/users'

test.group('GET:users', () => {
  test('unauthorized - missing: session', async ({ client }) => {
    const response = await client.get(route).qs({
      perPage: 100,
      page: 1,
    })

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@read')
    .tagResource('@user')
    .tagUnauthorized()

  UsersIndexCountTests(route)
  UsersIndexFilterTests(route)
  UsersIndexIncludeTests(route)
  UsersIndexOrderByTests(route)
  UsersIndexPaginateTests(route)
  UsersIndexSearchTests(route)
})
