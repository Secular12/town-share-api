import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthenticationController = () => import('#controllers/authentication_controller')

router
  .group(() => {
    router.post('login', [AuthenticationController, 'login']).use(middleware.guest())
    router.get('logout', [AuthenticationController, 'logout']).use(middleware.auth())
  })
  .prefix('authentication')
