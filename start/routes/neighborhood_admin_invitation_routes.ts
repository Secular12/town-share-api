import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const NeighborhoodAdminInvitationsController = () =>
  import('#controllers/neighborhood_admin_invitations_controller')

router
  .resource('neighborhood-admin-invitations', NeighborhoodAdminInvitationsController)
  .apiOnly()
  .except(['destroy', 'update'])
  .use('*', middleware.auth())

router
  .group(() => {
    router.patch('accept', [NeighborhoodAdminInvitationsController, 'accept'])
    router.patch('deny', [NeighborhoodAdminInvitationsController, 'deny'])
    router.post('resend', [NeighborhoodAdminInvitationsController, 'resend'])
    router.patch('revoke', [NeighborhoodAdminInvitationsController, 'revoke'])
  })
  .prefix('neighborhood-admin-invitations')
  .use(middleware.silentAuth())
