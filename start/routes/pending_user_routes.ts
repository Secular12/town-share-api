import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const PendingUsersController = () => import('#controllers/pending_users_controller')

router
  .resource('pending-users', PendingUsersController)
  .apiOnly()
  .except(['destroy', 'store', 'update'])
  .use('*', middleware.silentAuth())
