import { ResourceTag } from '#types/test_tags'
import * as TestUtil from '#utils/test'
import { test } from '@japa/runner'

export const success = (data: {
  authUserId?: number
  payload?: {
    page: number
    perPage: number
  }
  resourceData: unknown[]
  resourceTag: ResourceTag | ResourceTag[]
  route: string
}) => {
  test('successful pagination request', async ({ assert, client }) => {
    const response = await TestUtil.conditionalLoginAsRequest(
      client.get(data.route).qs(
        data.payload ?? {
          page: 1,
          perPage: 100,
        }
      ),
      data.authUserId
    )

    const body = response.body()

    response.assertStatus(200)
    assert.equal(body.meta.total, data.resourceData.length)
    assert.equal(body.meta.perPage, 100)
    assert.equal(body.meta.currentPage, 1)
    assert.equal(body.meta.lastPage, Math.ceil(data.resourceData.length / 100))
    assert.equal(body.meta.firstPage, 1)
    assert.equal(body.data.length, data.resourceData.length)
    assert.containsSubset(body.data, data.resourceData)
  })
    .tagCrud('@read')
    .tagResource(data.resourceTag)
    .tagSuccess()
}

export const missingPage = (data: {
  authUserId?: number
  perPage?: number
  resourceTag: ResourceTag | ResourceTag[]
  route: string
}) => {
  return test('unprocessable entity if missing page', async ({ client }) => {
    const response = await TestUtil.conditionalLoginAsRequest(
      client.get(data.route).qs({
        perPage: data.perPage ?? 100,
      }),
      data.authUserId
    )

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'page',
          message: 'The page field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource(data.resourceTag)
    .tagUnprocessableEntity()
}

export const missingPerPage = (data: {
  authUserId?: number
  resourceTag: ResourceTag | ResourceTag[]
  route: string
}) => {
  return test('unprocessable entity if missing perPage', async ({ client }) => {
    const response = await TestUtil.conditionalLoginAsRequest(
      client.get(data.route).qs({
        page: 1,
      }),
      data.authUserId
    )

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'perPage',
          message: 'The perPage field must be defined',
          rule: 'required',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource(data.resourceTag)
    .tagUnprocessableEntity()
}

export const perPageMax = (data: {
  authUserId?: number
  maxPerPage?: number
  resourceTag: ResourceTag | ResourceTag[]
  route: string
}) => {
  const maxPerPage = data.maxPerPage ?? 100
  return test(`unprocessable entity if perPage is larger than ${maxPerPage}`, async ({
    client,
  }) => {
    const response = await TestUtil.conditionalLoginAsRequest(
      client.get(data.route).qs({
        page: 1,
        perPage: maxPerPage + 1,
      }),
      data.authUserId
    )

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'perPage',
          message: `The perPage field must not be greater than ${maxPerPage}`,
          meta: {
            max: maxPerPage,
          },
          rule: 'max',
        },
      ],
    })
  })
    .tagCrud('@read')
    .tagResource(data.resourceTag)
    .tagUnprocessableEntity()
}
