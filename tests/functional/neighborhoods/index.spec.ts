import NeighborhoodsIndexCountTests from '#tests/functional/neighborhoods/index/count'
import NeighborhoodsIndexFilterTests from '#tests/functional/neighborhoods/index/filter'
import NeighborhoodsIndexIncludeTests from '#tests/functional/neighborhoods/index/include'
import NeighborhoodsIndexOrderByTests from '#tests/functional/neighborhoods/index/order_by'
import NeighborhoodsIndexPaginateTests from '#tests/functional/neighborhoods/index/paginate'
import NeighborhoodsIndexSearchTests from '#tests/functional/neighborhoods/index/search'
import { test } from '@japa/runner'

const route = '/neighborhoods'

test.group(`GET:neighborhoods`, () => {
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
    .tagResource('@neighborhood')
    .tagUnauthorized()

  NeighborhoodsIndexCountTests(route)
  NeighborhoodsIndexFilterTests(route)
  NeighborhoodsIndexIncludeTests(route)
  NeighborhoodsIndexOrderByTests(route)
  NeighborhoodsIndexPaginateTests(route)
  NeighborhoodsIndexSearchTests(route)
})
