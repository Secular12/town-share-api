import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import User from '#models/user'
import NeighborhoodsShowCountTests from '#tests/functional/neighborhoods/show/count'
import NeighborhoodsShowIncludeTests from '#tests/functional/neighborhoods/show/include'
import { test } from '@japa/runner'

const route = '/neighborhoods'

test.group(`GET:neighborhoods/:id`, () => {
  test('unauthorized - missing: session', async ({ client }) => {
    const response = await client.get(`${route}/1`)

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagUnauthorized()

  NeighborhoodsShowCountTests(route)
  NeighborhoodsShowIncludeTests(route)

  test('success - basic request', async ({ assert, client }) => {
    const user = await User.findOrFail(1)
    const response = await client.get(`${route}/1`).loginAs(user)
    const body = response.body()
    const { name } = neighborhoods[0]
    response.assertStatus(200)
    assert.containsSubset(body, { id: 1, name })
  })
    .tagCrud('@read')
    .tagResource('@neighborhood')
    .tagSuccess()
})
