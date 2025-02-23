import NeighborhoodAdminInvitationNotification from '#mails/neighborhood_admin_invitation_notification'
import AdminInvitation from '#models/admin_invitation'
import NeighborhoodAdminInvitation from '#models/neighborhood_admin_invitation'
import PendingUser from '#models/pending_user'
import User from '#models/user'
import NeighborhoodAdminInvitationPolicy from '#policies/neighborhood_admin_invitation_policy'
import ArrayUtil from '#utils/array'
import QueryUtil from '#utils/query'
import NeighborhoodAdminInvitationValidator from '#validators/neighborhood_admin_invitation'
import { Secret } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class NeighborhoodAdminInvitationsController {
  async accept({ bouncer, request, response }: HttpContext) {
    const { token } = await NeighborhoodAdminInvitationValidator.token.validate(request.body())

    const adminInvitationToken = await NeighborhoodAdminInvitation.adminInvitationTokens.verify(
      new Secret(token)
    )

    if (!adminInvitationToken) {
      return response.badRequest({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    const neighborhoodAdminInvitation = await NeighborhoodAdminInvitation.findOrFail(
      adminInvitationToken.tokenableId
    )

    const payload = await NeighborhoodAdminInvitationValidator.accept(
      neighborhoodAdminInvitation
    ).validate(request.body())

    await bouncer
      .with(NeighborhoodAdminInvitationPolicy)
      .authorize('acceptOrDeny', neighborhoodAdminInvitation)

    const pendingUser = neighborhoodAdminInvitation.pendingUserId
      ? await PendingUser.find(neighborhoodAdminInvitation.pendingUserId)
      : null

    if (neighborhoodAdminInvitation.pendingUserId && !pendingUser) {
      return response.badRequest({
        errors: [{ message: 'The associated pending user does not exist' }],
      })
    }

    await db.transaction(async (trx) => {
      const user = neighborhoodAdminInvitation.userId
        ? await User.query({ client: trx })
            .withScopes((scopes) => scopes.isActive())
            .where('id', neighborhoodAdminInvitation.userId)
            .preload('neighborhoods')
            .first()
        : await User.create(
            {
              sponsorId: neighborhoodAdminInvitation.inviterId,
              email: pendingUser!.email,
              firstName: payload.firstName,
              lastName: payload.lastName,
              middleName: payload.middleName,
              nameSuffix: payload.nameSuffix,
              password: payload.password,
            },
            { client: trx }
          )

      if (user && neighborhoodAdminInvitation.pendingUserId && payload.phoneNumbers) {
        await user.related('phoneNumbers').createMany(payload.phoneNumbers, { client: trx })
      }

      if (!user) {
        return response.badRequest({
          errors: [{ message: 'The associated user does not exist or has been deactivated' }],
        })
      }

      await user.related('neighborhoods').sync(
        {
          [neighborhoodAdminInvitation.neighborhoodId]: {
            is_neighborhood_admin: true,
          },
        },
        false
      )

      const neighborhoodAdminInvitations = await NeighborhoodAdminInvitation.query({ client: trx })
        .select(['id', 'neighborhoodId', 'pendingUserId', 'userId'])
        .where('neighborhoodId', neighborhoodAdminInvitation.neighborhoodId)
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

      const updatedNeighborhoodAdminInvitations =
        await NeighborhoodAdminInvitation.updateOrCreateMany(
          'id',
          neighborhoodAdminInvitations.map(({ id, userId }) => {
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

      for await (const updatedNeighborhoodAdminInvitation of updatedNeighborhoodAdminInvitations) {
        const currentTokens = await NeighborhoodAdminInvitation.adminInvitationTokens.all(
          updatedNeighborhoodAdminInvitation
        )

        for await (const currentToken of currentTokens) {
          await NeighborhoodAdminInvitation.adminInvitationTokens.delete(
            updatedNeighborhoodAdminInvitation,
            currentToken.identifier
          )
        }
      }

      if (pendingUser) {
        // TODO: other pendingUser to User updates
        const adminInvitations = await AdminInvitation.query()
          .select('id')
          .where('pendingUserId', pendingUser.id)

        await AdminInvitation.updateOrCreateMany(
          'id',
          adminInvitations.map(({ id }) => ({
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

    await neighborhoodAdminInvitation.refresh()
    await neighborhoodAdminInvitation.load('user', (userLoadQuery) =>
      userLoadQuery.preload('phoneNumbers').preload('adminedNeighborhoods')
    )

    return neighborhoodAdminInvitation
  }

  async deny({ bouncer, request, response }: HttpContext) {
    const { token } = await NeighborhoodAdminInvitationValidator.token.validate(request.body())

    const adminInvitationToken = await NeighborhoodAdminInvitation.adminInvitationTokens.verify(
      new Secret(token)
    )

    if (!adminInvitationToken) {
      return response.badRequest({
        errors: [{ message: 'The provided token is invalid or expired' }],
      })
    }

    const neighborhoodAdminInvitation = await NeighborhoodAdminInvitation.findOrFail(
      adminInvitationToken.tokenableId
    )

    await bouncer
      .with(NeighborhoodAdminInvitationPolicy)
      .authorize('acceptOrDeny', neighborhoodAdminInvitation)

    await db.transaction(async (trx) => {
      const neighborhoodAdminInvitations = await NeighborhoodAdminInvitation.query({ client: trx })
        .select('id')
        .where('neighborhoodId', neighborhoodAdminInvitation.neighborhoodId)
        .if(
          neighborhoodAdminInvitation.pendingUserId,
          (pendingUserQuery) => {
            pendingUserQuery.where('pendingUserId', neighborhoodAdminInvitation.pendingUserId!)
          },
          (userQuery) => {
            userQuery.where('userId', neighborhoodAdminInvitation.userId!)
          }
        )
        .withScopes((scopes) => scopes.isPending())

      const dateTimeNow = DateTime.utc()

      const updatedNeighborhoodAdminInvitations =
        await NeighborhoodAdminInvitation.updateOrCreateMany(
          'id',
          neighborhoodAdminInvitations.map(({ id }) => {
            return {
              id,
              deniedAt: dateTimeNow,
            }
          }),
          { client: trx }
        )

      for await (const updatedNeighborhoodAdminInvitation of updatedNeighborhoodAdminInvitations) {
        const currentTokens = await NeighborhoodAdminInvitation.adminInvitationTokens.all(
          updatedNeighborhoodAdminInvitation
        )

        for await (const currentToken of currentTokens) {
          await NeighborhoodAdminInvitation.adminInvitationTokens.delete(
            updatedNeighborhoodAdminInvitation,
            currentToken.identifier
          )
        }
      }
    })

    await neighborhoodAdminInvitation.refresh()

    return neighborhoodAdminInvitation
  }

  async index({ bouncer, request }: HttpContext) {
    const payload = await NeighborhoodAdminInvitationValidator.index.validate(request.qs())

    await bouncer
      .with(NeighborhoodAdminInvitationPolicy)
      .authorize('readMany', payload.neighborhoodId)

    return NeighborhoodAdminInvitation.query()
      .select('neighborhood_admin_invitations.*')
      .withScopes((scopes) =>
        scopes.include(payload, NeighborhoodAdminInvitationValidator.preloadOptions)
      )
      .if(payload.inviterId, (inviterIdQuery) => {
        inviterIdQuery.where('inviterId', payload.inviterId!)
      })
      .if(payload.neighborhoodId, (neighborhoodIdQuery) => {
        neighborhoodIdQuery.where('neighborhoodId', payload.neighborhoodId!)
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
    const payload = await NeighborhoodAdminInvitationValidator.resend.validate(request.body())

    const neighborhoodAdminInvitation = await NeighborhoodAdminInvitation.query()
      .preload('inviter')
      .preload('neighborhood')
      .preload('pendingUser')
      .preload('user')
      .where('id', params.id)
      .firstOrFail()

    await bouncer
      .with(NeighborhoodAdminInvitationPolicy)
      .authorize('resend', neighborhoodAdminInvitation)

    if (!neighborhoodAdminInvitation.isPending) {
      return response.badRequest({
        errors: [{ message: 'This admin invitation has already been completed' }],
      })
    }

    const token = await NeighborhoodAdminInvitation.adminInvitationTokens.create(
      neighborhoodAdminInvitation
    )

    const email =
      neighborhoodAdminInvitation.user?.email ?? neighborhoodAdminInvitation.pendingUser?.email

    await mail.send(
      new NeighborhoodAdminInvitationNotification({
        recipients: { to: email },
        invitationLinkUrl: payload.invitationLinkUrl,
        inviter: neighborhoodAdminInvitation.inviter,
        message: payload.message,
        neighborhood: neighborhoodAdminInvitation.neighborhood,
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
    const payload = await NeighborhoodAdminInvitationValidator.revoke.validate(request.body())

    await bouncer
      .with(NeighborhoodAdminInvitationPolicy)
      .authorize('revoke', payload.neighborhoodId)

    const neighborhoodAdminInvitations = await NeighborhoodAdminInvitation.query()
      .withScopes((scopes) => scopes.isPending())
      .where('neighborhoodId', payload.neighborhoodId)
      .if('pendingUserId' in payload, (pendingUserIdQuery) => {
        if (!('pendingUserId' in payload)) return

        pendingUserIdQuery.where('pendingUserId', payload.pendingUserId)
      })
      .if('userId' in payload, (userIdQuery) => {
        if (!('userId' in payload)) return

        userIdQuery.where('userId', payload.userId)
      })

    if (!neighborhoodAdminInvitations.length) {
      return response.badRequest({
        errors: [{ message: 'There are not pending admin invitations' }],
      })
    }

    for await (const neighborhoodAdminInvitation of neighborhoodAdminInvitations) {
      const currentTokens = await NeighborhoodAdminInvitation.adminInvitationTokens.all(
        neighborhoodAdminInvitation
      )

      for await (const currentToken of currentTokens) {
        await NeighborhoodAdminInvitation.adminInvitationTokens.delete(
          neighborhoodAdminInvitation,
          currentToken.identifier
        )
      }
    }

    const neighborhoodAdminInvitationsUpdate = neighborhoodAdminInvitations.map(
      ({ id }: { id: number }) => ({
        id,
        revokedAt: DateTime.utc(),
      })
    )

    return NeighborhoodAdminInvitation.updateOrCreateMany('id', neighborhoodAdminInvitationsUpdate)
  }

  async show({ bouncer, params, request }: HttpContext) {
    const payload = await NeighborhoodAdminInvitationValidator.show.validate(request.qs())

    await bouncer.with(NeighborhoodAdminInvitationPolicy).authorize('read', params.id)

    return NeighborhoodAdminInvitation.query()
      .withScopes((scopes) =>
        scopes.include(payload, NeighborhoodAdminInvitationValidator.preloadOptions)
      )
      .where('id', params.id)
      .firstOrFail()
  }

  async store({ auth, bouncer, request, response }: HttpContext) {
    const payload = await NeighborhoodAdminInvitationValidator.store.validate(request.body())

    await bouncer
      .with(NeighborhoodAdminInvitationPolicy)
      .authorize('create', payload.neighborhoodId)

    const isUser = (item: User | PendingUser): item is User => {
      const jsonItem = item.toJSON()
      return 'deactivatedAt' in jsonItem
    }

    const trxResponse = await db.transaction(async (trx) => {
      const user =
        'userId' in payload
          ? await User.query({ client: trx })
              .preload('adminedNeighborhoods', (adminedNeighborhoodsQuery) => {
                adminedNeighborhoodsQuery.where('neighborhoodId', payload.neighborhoodId)
              })
              .where('id', payload.userId)
              .firstOrFail()
          : 'pendingUserId' in payload
            ? await PendingUser.findOrFail(payload.pendingUserId, { client: trx })
            : (await User.query({ client: trx })
                .preload('adminedNeighborhoods', (adminedNeighborhoodsQuery) => {
                  adminedNeighborhoodsQuery.where('neighborhoodId', payload.neighborhoodId)
                })
                .where('email', payload.email)
                .first()) ||
              (await PendingUser.findBy({ email: payload.email }, { client: trx })) ||
              (await PendingUser.create({ email: payload.email }, { client: trx }))

      if (isUser(user)) {
        if (!user.isActive) {
          await trx.rollback()

          return response.badRequest({
            errors: [{ message: 'The provided user has been deactivated' }],
          })
        }

        if (user.adminedNeighborhoods.length > 0) {
          await trx.rollback()

          return response.badRequest({
            errors: [
              {
                message: `The provided user is already a neighborhood admin for neighborhoodId: ${payload.neighborhoodId}`,
              },
            ],
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
                'There is already a pending neighborhood admin invitation sent by you. Use the resend route instead',
            },
          ],
        })
      }

      const neighborhoodAdminInvitation = isUser(user)
        ? await NeighborhoodAdminInvitation.create(
            {
              inviterId: auth.user!.id,
              neighborhoodId: payload.neighborhoodId,
              userId: user.id,
              message: payload.message,
            },
            { client: trx }
          )
        : await NeighborhoodAdminInvitation.create(
            {
              inviterId: auth.user!.id,
              neighborhoodId: payload.neighborhoodId,
              pendingUserId: user.id,
              message: payload.message,
            },
            { client: trx }
          )

      await neighborhoodAdminInvitation.refresh()

      await neighborhoodAdminInvitation.load('neighborhood')
      await neighborhoodAdminInvitation.load('pendingUser')
      await neighborhoodAdminInvitation.load('user')

      return { neighborhoodAdminInvitation, user }
    })

    if (trxResponse?.neighborhoodAdminInvitation && trxResponse?.user) {
      const token = await NeighborhoodAdminInvitation.adminInvitationTokens.create(
        trxResponse.neighborhoodAdminInvitation
      )

      await mail.send(
        new NeighborhoodAdminInvitationNotification({
          recipients: { to: trxResponse.user.email },
          invitationLinkUrl: payload.invitationLinkUrl,
          inviter: auth.user!,
          message: payload.message,
          neighborhood: trxResponse.neighborhoodAdminInvitation.neighborhood,
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

      return trxResponse.neighborhoodAdminInvitation
    }
  }
}
