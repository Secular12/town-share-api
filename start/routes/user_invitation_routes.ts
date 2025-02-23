import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserInvitationsController = () => import('#controllers/user_invitations_controller')

router
  .resource('user-invitations', UserInvitationsController)
  .apiOnly()
  .only(['store'])
  .use('*', middleware.auth())
