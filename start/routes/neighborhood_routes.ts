import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const NeighborhoodsController = () => import('#controllers/neighborhoods_controller')

router
  .resource('neighborhoods', NeighborhoodsController)
  .apiOnly()
  .except(['destroy'])
  .use('*', middleware.auth())
