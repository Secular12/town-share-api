import User from '#models/user'
import vine from '@vinejs/vine'

const isAdmin = (authUser: User) =>
  vine.group([
    vine.group.if((_data) => authUser.isAdmin, {
      isAdmin: vine.boolean().optional(),
    }),
  ])

export const index = vine.compile(
  vine.object({
    orderBy: vine
      .array(
        vine.object({
          column: vine.enum([
            'email',
            'firstName',
            'isAdmin',
            'lastName',
            'middleName',
            'nameSuffix',
            'createdAt',
            'updatedAt',
          ] as const),
          order: vine.enum(['asc', 'desc'] as const),
        })
      )
      .distinct('column')
      .optional(),
    page: vine.number().min(1),
    perPage: vine.number().max(100).min(1),
  })
)

export const update = (authUser: User) =>
  vine.compile(
    vine
      .object({
        firstName: vine.string().minLength(1).optional(),
        lastName: vine.string().minLength(1).optional(),
        middleName: vine.string().minLength(1).nullable().optional(),
        nameSuffix: vine.string().minLength(1).nullable().optional(),
      })
      .merge(isAdmin(authUser))
  )
