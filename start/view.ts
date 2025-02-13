import env from '#start/env'
import edge from 'edge.js'

edge.global('appName', env.get('APP_NAME'))
