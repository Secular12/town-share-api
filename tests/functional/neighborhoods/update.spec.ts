import { neighborhoods } from '#database/seeders/test/neighborhood_seeder'
import Neighborhood from '#models/neighborhood'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('PATCH:neighborhoods/:id', () => {
  test('unauthorized - missing session', async ({ client }) => {
    const response = await client.patch('/neighborhoods/1').json({})

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagUnauthorized()

  test('forbidden - not neighborhood admin or application admin', async ({ client }) => {
    const user = await User.findOrFail(2)

    const response = await client.patch('neighborhoods/1').json({ lastName: 'Foo' }).loginAs(user)

    response.assertStatus(403)
    response.assertBody({
      errors: [{ message: 'Access denied' }],
    })
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagForbidden()

  test('forbidden - suspending by a non application admin')
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagForbidden()
    .tagToDo()

  test('forbidden - removing suspension by a non application admin')
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagForbidden()
    .tagToDo()

  test('unprocessable entity - is not unique: name', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client
      .patch('neighborhoods/2')
      .json({ name: 'North Hills' })
      .loginAs(user)

    response.assertStatus(422)

    response.assertBody({
      errors: [
        {
          field: 'name',
          message: 'The name field must be unique',
          rule: 'unique',
        },
      ],
    })
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()

  test('unprocessable entity - is not date: suspendedAt')
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagUnprocessableEntity()
    .tagToDo()

  test('success - not nullable: city, country, name, state', async ({ client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodSeedData = neighborhoods[0]

    const response = await client
      .patch('neighborhoods/1')
      .json({ city: null, country: null, name: null, state: null })
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      city: neighborhoodSeedData.city,
      country: 'United States of America',
      name: neighborhoodSeedData.name,
      state: neighborhoodSeedData.state,
    })
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - nullable: zip', async ({ client }) => {
    const user = await User.findOrFail(1)
    const neighborhoodSeedData = neighborhoods[0]

    const response = await client.patch('/neighborhoods/1').json({ zip: null }).loginAs(user)

    console.log(response.body())

    response.assertStatus(200)

    response.assertBodyNotContains({
      zip: neighborhoodSeedData.zip,
    })

    response.assertBodyContains({
      city: neighborhoodSeedData.city,
      country: 'United States of America',
      name: neighborhoodSeedData.name,
      state: neighborhoodSeedData.state,
      zip: null,
    })
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - when not application admin but neighborhood admin', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(4)

    const updateData = {
      city: 'Rome',
      name: 'Rome Co-Op',
      state: 'New York',
      zip: '13440',
    }

    const response = await client.patch('/neighborhoods/1').json(updateData).loginAs(user)

    response.assertStatus(200)
    assert.containsSubset(response.body(), updateData)

    const updatedNeighborhood = await Neighborhood.findOrFail(1)

    await updatedNeighborhood.merge(neighborhoods[0]).save()
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagSuccess()

  test('success - when application admin and not neighborhood admin', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const updateData = {
      city: 'Rome',
      name: 'Rome Co-Op',
      state: 'New York',
      zip: '13440',
    }

    const response = await client.patch('/neighborhoods/1').json(updateData).loginAs(user)

    response.assertStatus(200)
    assert.containsSubset(response.body(), updateData)

    const updatedNeighborhood = await Neighborhood.findOrFail(1)

    await updatedNeighborhood.merge(neighborhoods[0]).save()
  })
    .tagCrud('@update')
    .tagResource('@neighborhood')
    .tagSuccess()
})
