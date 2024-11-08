import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('PATCH:users/:id', () => {
  test('unauthorized when logged out', async ({ client }) => {
    const response = await client.patch('/users/1').json({ lastName: 'Foo' })

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagUnauthorized()

  test('forbidden when not user or application admin', async ({ client }) => {
    const user = await User.findOrFail(2)

    const response = await client.patch('/users/1').json({ lastName: 'Foo' }).loginAs(user)

    response.assertStatus(403)
    response.assertBody({
      errors: [{ message: 'Access denied' }],
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagForbidden()

  test('forbidden when editing isApplicationAdmin not an application admin', async ({ client }) => {
    const user = await User.findOrFail(2)

    const response = await client.patch('/users/2').json({ isApplicationAdmin: true }).loginAs(user)

    response.assertStatus(403)
    response.assertBody({
      errors: [{ message: 'Access denied' }],
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagForbidden()

  test('successful when non-admin and editing own user', async ({ assert, client }) => {
    const user = await User.findOrFail(2)

    const updateData = {
      firstName: 'Foo',
      lastName: 'Bar',
      middleName: 'Fizz',
      nameSuffix: 'Buzz',
    }

    const response = await client.patch('/users/2').json(updateData).loginAs(user)

    response.assertStatus(200)
    assert.containsSubset(response.body(), updateData)

    const updatedUser = await User.findOrFail(2)

    await updatedUser.merge(users[1]).save()
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagSuccess()

  test('successful when application admin and editing other user', async ({ assert, client }) => {
    const user = await User.findOrFail(1)

    const updateData = {
      firstName: 'Foo',
      lastName: 'Bar',
      middleName: 'Fizz',
      nameSuffix: 'Buzz',
    }

    const response = await client.patch('/users/2').json(updateData).loginAs(user)

    response.assertStatus(200)
    assert.containsSubset(response.body(), updateData)

    const updatedUser = await User.findOrFail(2)

    await updatedUser.merge(users[1]).save()
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagSuccess()

  test('successful when application admin and editing other isApplicationAdmin', async ({
    assert,
    client,
  }) => {
    const user = await User.findOrFail(1)

    const updateData = {
      firstName: 'Foo',
      isApplicationAdmin: true,
      lastName: 'Bar',
      middleName: 'Fizz',
      nameSuffix: 'Buzz',
    }

    const response = await client.patch('/users/2').json(updateData).loginAs(user)

    response.assertStatus(200)
    assert.containsSubset(response.body(), updateData)

    const updatedUser = await User.findOrFail(2)

    await updatedUser.merge(users[1]).save()
  })
})
