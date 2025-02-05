import { users } from '#database/seeders/test/user_seeder'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('PATCH:users/:id', () => {
  test('unauthorized - missing session', async ({ client }) => {
    const response = await client.patch('/users/1').json({ lastName: 'Foo' })

    response.assertStatus(401)
    response.assertBody({
      errors: [{ message: 'Unauthorized access' }],
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagUnauthorized()

  test('unprocessable entity - is not boolean: isApplicationAdmin', async ({ client }) => {
    const user = await User.findOrFail(1)

    const response = await client.patch('/users/1').json({ isApplicationAdmin: 'a' }).loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'isApplicationAdmin',
          message: 'The value must be a boolean',
          rule: 'boolean',
        },
      ],
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagUnprocessableEntity()

  test('unprocessable entity - is not date: deactivatedAt')
    .tagCrud('@update')
    .tagResource('@user')
    .tagForbidden()
    .tagToDo()

  test('not nullable: email')
    .tagCrud('@update')
    .tagResource('@user')
    .tagUnprocessableEntity()
    .tagToDo()

  test('forbidden - not user or application admin', async ({ client }) => {
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

  test('forbidden - suspending by a non application admin')
    .tagCrud('@update')
    .tagResource('@user')
    .tagForbidden()
    .tagToDo()

  test('forbidden - removing suspension by a non application admin')
    .tagCrud('@update')
    .tagResource('@user')
    .tagForbidden()
    .tagToDo()

  test('forbidden - editing isApplicationAdmin by a non application admin', async ({ client }) => {
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

  test('success - not nullable: firstName, lastName', async ({ client }) => {
    const user = await User.findOrFail(1)
    const userSeedData = users[0]

    const response = await client
      .patch('/users/1')
      .json({ firstName: null, lastName: null })
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      firstName: userSeedData.firstName,
      lastName: userSeedData.lastName,
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagSuccess()

  test('success - nullable: middleName, nameSuffix', async ({ client }) => {
    const user = await User.findOrFail(2)
    const userSeedData = users[1]

    const response = await client
      .patch('/users/2')
      .json({ middleName: null, nameSuffix: null })
      .loginAs(user)

    response.assertStatus(200)

    response.assertBodyNotContains({
      middleName: userSeedData.middleName,
      nameSuffix: userSeedData.nameSuffix,
    })

    response.assertBodyContains({
      middleName: null,
      nameSuffix: null,
    })
  })
    .tagCrud('@update')
    .tagResource('@user')
    .tagSuccess()

  test('success - when non-admin and editing own user', async ({ assert, client }) => {
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

  test('success - when application admin and editing other user', async ({ assert, client }) => {
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

  test('success - when application admin and editing other isApplicationAdmin', async ({
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

  test('change email').tagCrud('@update').tagResource('@user').tagSuccess().tagToDo()
})
