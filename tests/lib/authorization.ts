import { ResourceTag } from '#types/test_tags'
import { test } from '@japa/runner'

export const missingSession = (data: {
  resourceTag: ResourceTag | ResourceTag[]
  route: string
}) => {
  test('unauthorized when logged out', async ({ client }) => {
    const response = await client.get(data.route)

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@read')
    .tagResource(data.resourceTag)
    .tagUnauthorized()
}
