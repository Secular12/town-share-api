import AdminInvitationNotification from '#mails/admin_invitation_notification'
import AdminInvitation from '#models/admin_invitation'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import PendingUser from '#models/pending_user'
import User from '#models/user'
import AdminInvitationPolicy from '#policies/admin_invitation_policy'
import ArrayUtil from '#utils/array'
import QueryUtil from '#utils/query'
import AdminInvitationValidator from '#validators/admin_invitation'
import { Secret } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class AdminInvitationsController {
  async accept({ bouncer, request, response }: HttpContext) {
    const { token } = await AdminInvitationValidator.token.validate(request.body())

    const adminInvitationToken = await AdminInvitation.adminInvitationTokens.verify(
      new Secret(token)
    )

    if (!adminInvitationToken) {
      return response.badRequest({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    const adminInvitation = await AdminInvitation.findOrFail(adminInvitationToken.tokenableId)

    const payload = await AdminInvitationValidator.accept(adminInvitation).validate(request.body())

    await bouncer.with(AdminInvitationPolicy).authorize('acceptOrDeny', adminInvitation)

    const pendingUser = adminInvitation.pendingUserId
      ? await PendingUser.find(adminInvitation.pendingUserId)
      : null

    if (adminInvitation.pendingUserId && !pendingUser) {
      return response.badRequest({
        errors: [{ message: 'The associated pending user does not exist' }],
      })
    }

    await db.transaction(async (trx) => {
      const user = adminInvitation.userId
        ? await User.query({ client: trx })
            .withScopes((scopes) => scopes.isActive())
            .where('id', adminInvitation.userId)
            .first()
        : await User.create(
            {
              sponsorId: adminInvitation.inviterId,
              email: pendingUser!.email,
              firstName: payload.firstName,
              lastName: payload.lastName,
              middleName: payload.middleName,
              nameSuffix: payload.nameSuffix,
              password: payload.password,
            },
            { client: trx }
          )

      if (user && adminInvitation.pendingUserId && payload.phoneNumbers) {
        await user.related('phoneNumbers').createMany(payload.phoneNumbers, { client: trx })
      }

      if (!user) {
        return response.badRequest({
          errors: [{ message: 'The associated user does not exist or has been deactivated' }],
        })
      }

      user.isApplicationAdmin = true

      await user.save()

      const adminInvitations = await AdminInvitation.query({ client: trx })
        .select(['id', 'pendingUserId', 'userId'])
        .if(
          pendingUser,
          (pendingUserQuery) => {
            pendingUserQuery.where('pendingUserId', pendingUser!.id)
          },
          (userQuery) => {
            userQuery.where('userId', user.id)
          }
        )
        .withScopes((scopes) => scopes.isPending())

      const dateTimeNow = DateTime.utc()

      const updatedAdminInvitations = await AdminInvitation.updateOrCreateMany(
        'id',
        adminInvitations.map(({ id, userId }) => {
          if (userId) {
            return {
              id,
              acceptedAt: dateTimeNow,
            }
          }

          return {
            id,
            pendingUserId: null,
            userId: user.id,
            acceptedAt: dateTimeNow,
          }
        }),
        { client: trx }
      )

      for await (const updatedAdminInvitation of updatedAdminInvitations) {
        const currentTokens =
          await AdminInvitation.adminInvitationTokens.all(updatedAdminInvitation)

        for await (const currentToken of currentTokens) {
          await AdminInvitation.adminInvitationTokens.delete(
            updatedAdminInvitation,
            currentToken.identifier
          )
        }
      }

      if (pendingUser) {
        // TODO: other pendingUser to User updates
        const neighborhoodAdminInvitations = await NeighborhoodAdminInvitation.query()
          .select('id')
          .where('pendingUserId', pendingUser.id)

        await NeighborhoodAdminInvitation.updateOrCreateMany(
          'id',
          neighborhoodAdminInvitations.map(({ id }) => ({
            id,
            pendingUserId: null,
            userId: user.id,
          }))
        )
      }
    })

    if (pendingUser) {
      await pendingUser.delete()
    }

    await adminInvitation.refresh()
    await adminInvitation.load('user', (userLoadQuery) => userLoadQuery.preload('phoneNumbers'))

    return adminInvitation
  }

  async deny({ bouncer, request, response }: HttpContext) {
    const { token } = await AdminInvitationValidator.token.validate(request.body())

    const adminInvitationToken = await AdminInvitation.adminInvitationTokens.verify(
      new Secret(token)
    )

    if (!adminInvitationToken) {
      return response.badRequest({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    const adminInvitation = await AdminInvitation.findOrFail(adminInvitationToken.tokenableId)

    await bouncer.with(AdminInvitationPolicy).authorize('acceptOrDeny', adminInvitation)

    await db.transaction(async (trx) => {
      const adminInvitations = await AdminInvitation.query({ client: trx })
        .select('id')
        .if(
          adminInvitation.pendingUserId,
          (pendingUserQuery) => {
            pendingUserQuery.where('pendingUserId', adminInvitation.pendingUserId!)
          },
          (userQuery) => {
            userQuery.where('userId', adminInvitation.userId!)
          }
        )
        .withScopes((scopes) => scopes.isPending())

      const dateTimeNow = DateTime.utc()

      const updatedAdminInvitations = await AdminInvitation.updateOrCreateMany(
        'id',
        adminInvitations.map(({ id }) => {
          return {
            id,
            deniedAt: dateTimeNow,
          }
        }),
        { client: trx }
      )

      for await (const updatedAdminInvitation of updatedAdminInvitations) {
        const currentTokens =
          await AdminInvitation.adminInvitationTokens.all(updatedAdminInvitation)

        for await (const currentToken of currentTokens) {
          await AdminInvitation.adminInvitationTokens.delete(
            updatedAdminInvitation,
            currentToken.identifier
          )
        }
      }
    })

    await adminInvitation.refresh()

    return adminInvitation
  }

  async index({ bouncer, request }: HttpContext) {
    const payload = await AdminInvitationValidator.index.validate(request.qs())

    await bouncer.with(AdminInvitationPolicy).authorize('readMany')

    return AdminInvitation.query()
      .select('admin_invitations.*')
      .withScopes((scopes) => scopes.include(payload, AdminInvitationValidator.preloadOptions))
      .if(payload.inviterId, (inviterIdQuery) => {
        inviterIdQuery.where('inviterId', payload.inviterId!)
      })
      .if(payload.isPending === true, (isActiveQuery) => {
        isActiveQuery.withScopes((scopes) => scopes.isPending())
      })
      .if(payload.isPending === false, (isNotActiveQuery) => {
        isNotActiveQuery.withScopes((scopes) => scopes.isNotPending())
      })
      .if(payload.userId, (userIdQuery) => {
        userIdQuery.where('userId', payload.userId!)
      })
      .if(payload.orderBy, (orderByQuery) => {
        orderByQuery.orderBy(ArrayUtil.orderBy(payload.orderBy!))
      })
      .if(payload.search, (searchQuery) => {
        searchQuery.withScopes((scopes) => {
          scopes.search(payload)
        })
      })
      .where(QueryUtil.dateFilter(payload))
      .paginate(payload.page, payload.perPage)
  }

  async resend({ bouncer, params, request, response }: HttpContext) {
    const payload = await AdminInvitationValidator.resend.validate(request.body())

    const adminInvitation = await AdminInvitation.query()
      .preload('inviter')
      .preload('pendingUser')
      .preload('user')
      .where('id', params.id)
      .firstOrFail()

    await bouncer.with(AdminInvitationPolicy).authorize('resend', adminInvitation)

    if (!adminInvitation.isPending) {
      return response.badRequest({
        errors: [{ message: 'This admin invitation has already been completed' }],
      })
    }

    const token = await AdminInvitation.adminInvitationTokens.create(adminInvitation)

    const email = adminInvitation.user?.email ?? adminInvitation.pendingUser?.email

    await mail.send(
      new AdminInvitationNotification({
        recipients: { to: email },
        inviter: adminInvitation.inviter,
        message: payload.message,
        token: {
          expiration: token.expiresAt
            ? DateTime.fromJSDate(token.expiresAt)
                .setZone(payload.timezone)
                .toLocaleString(DateTime.DATETIME_FULL)
            : null,
          value: token.value!.release(),
        },
      })
    )
  }

  async revoke({ bouncer, request, response }: HttpContext) {
    const payload = await AdminInvitationValidator.revoke.validate(request.body())

    await bouncer.with(AdminInvitationPolicy).authorize('revoke')

    const adminInvitations = await AdminInvitation.query()
      .withScopes((scopes) => scopes.isPending())
      .if('pendingUserId' in payload, (pendingUserIdQuery) => {
        if (!('pendingUserId' in payload)) return

        pendingUserIdQuery.where('pendingUserId', payload.pendingUserId)
      })
      .if('userId' in payload, (userIdQuery) => {
        if (!('userId' in payload)) return

        userIdQuery.where('userId', payload.userId)
      })

    if (!adminInvitations.length) {
      return response.badRequest({
        errors: [{ message: 'There are not pending admin invitations' }],
      })
    }

    for await (const adminInvitation of adminInvitations) {
      const currentTokens = await AdminInvitation.adminInvitationTokens.all(adminInvitation)

      for await (const currentToken of currentTokens) {
        await AdminInvitation.adminInvitationTokens.delete(adminInvitation, currentToken.identifier)
      }
    }

    const adminInvitationsUpdate = adminInvitations.map(({ id }: { id: number }) => ({
      id,
      revokedAt: DateTime.utc(),
    }))

    return AdminInvitation.updateOrCreateMany('id', adminInvitationsUpdate)
  }

  async show({ bouncer, params, request }: HttpContext) {
    const payload = await AdminInvitationValidator.show.validate(request.qs())

    await bouncer.with(AdminInvitationPolicy).authorize('read', params.id)

    return AdminInvitation.query()
      .withScopes((scopes) => scopes.include(payload, AdminInvitationValidator.preloadOptions))
      .where('id', params.id)
      .firstOrFail()
  }

  async store({ auth, bouncer, request, response }: HttpContext) {
    const payload = await AdminInvitationValidator.store.validate(request.body())

    await bouncer.with(AdminInvitationPolicy).authorize('create')

    const isUser = (item: User | PendingUser): item is User => {
      const jsonItem = item.toJSON()
      return 'deactivatedAt' in jsonItem
    }

    const trxResponse = await db.transaction(async (trx) => {
      const user =
        'userId' in payload
          ? await User.findOrFail(payload.userId, { client: trx })
          : 'pendingUserId' in payload
            ? await PendingUser.findOrFail(payload.pendingUserId, { client: trx })
            : (await User.findBy({ email: payload.email }, { client: trx })) ||
              (await PendingUser.findBy({ email: payload.email }, { client: trx })) ||
              (await PendingUser.create({ email: payload.email }, { client: trx }))

      if (isUser(user)) {
        if (!user.isActive) {
          await trx.rollback()

          return response.badRequest({
            errors: [{ message: 'The provided user has been deactivated' }],
          })
        }

        if (user.isApplicationAdmin) {
          await trx.rollback()

          return response.badRequest({
            errors: [{ message: 'The provided user is already an application admin' }],
          })
        }

        await user.load('receivedAdminInvitations', (receivedAdminInvitationsQuery) => {
          receivedAdminInvitationsQuery.whereNull('acceptedAt').whereNull('deniedAt')
        })
      } else {
        await user.load('receivedAdminInvitations', (receivedAdminInvitationsQuery) => {
          receivedAdminInvitationsQuery.whereNull('acceptedAt').whereNull('deniedAt')
        })
      }

      if (
        user.receivedAdminInvitations.some(
          ({ inviterId }: { inviterId: number }) => inviterId === auth.user!.id
        )
      ) {
        await trx.rollback()

        return response.badRequest({
          errors: [
            {
              message:
                'There is already a pending admin invitation sent by you. Use the resend route instead',
            },
          ],
        })
      }

      const adminInvitation = isUser(user)
        ? await AdminInvitation.create(
            {
              inviterId: auth.user!.id,
              userId: user.id,
              message: payload.message,
            },
            { client: trx }
          )
        : await AdminInvitation.create(
            {
              inviterId: auth.user!.id,
              pendingUserId: user.id,
              message: payload.message,
            },
            { client: trx }
          )

      return { adminInvitation, user }
    })

    if (trxResponse?.adminInvitation && trxResponse?.user) {
      const token = await AdminInvitation.adminInvitationTokens.create(trxResponse.adminInvitation)

      await mail.send(
        new AdminInvitationNotification({
          recipients: { to: trxResponse.user.email },
          inviter: auth.user!,
          message: payload.message,
          token: {
            expiration: token.expiresAt
              ? DateTime.fromJSDate(token.expiresAt)
                  .setZone(payload.timezone)
                  .toLocaleString(DateTime.DATETIME_FULL)
              : null,
            value: token.value!.release(),
          },
        })
      )

      return trxResponse.adminInvitation
    }
  }
}
