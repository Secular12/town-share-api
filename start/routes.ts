/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import '#start/routes/authentication_routes'
import '#start/routes/neighborhood_routes'
import '#start/routes/user_routes'
import router from '@adonisjs/core/services/router'

router.where('id', router.matchers.number())
