import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AdminInvitationsController = () => import('#controllers/admin_invitations_controller')

router
  .resource('admin-invitations', AdminInvitationsController)
  .apiOnly()
  .except(['destroy', 'update'])
  .use('*', middleware.auth())

router
  .group(() => {
    router.patch('accept', [AdminInvitationsController, 'accept'])
    router.patch('deny', [AdminInvitationsController, 'deny'])
    router.post('resend', [AdminInvitationsController, 'resend'])
    router.patch('revoke', [AdminInvitationsController, 'revoke'])
  })
  .prefix('admin-invitations')
  .use(middleware.silentAuth())
