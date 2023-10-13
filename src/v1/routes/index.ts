import { Router } from 'express'
import { HttpError, HttpStatusCodes } from 'common-stuff'
import { middleware } from 'express-openapi-validator'
import swaggerUi from 'swagger-ui-express'

import { Globals } from '@config'
import { logsRouter } from './logs'
import { defaultRouter } from './default'
import { createRouter, openapi } from '@v1/services/openapi'

export function getApiRouter(globals: Globals): Router {
  const { config } = globals
  const app = Router()

  openapi.servers = [
    {
      url: `http://${config.host}:${config.port}/api/v1`,
    },
  ]

  if (config.environment === 'development') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi))
  }

  app.get('/status', (_req, res) => res.send({ status: 'ok' }))

  app.use(
    middleware({
      apiSpec: openapi,
      validateRequests: true,
      validateResponses: config.environment === 'development',
      ignorePaths: (path: string) => {
        return !['/api'].some((v) => path.startsWith(v))
      },
      validateSecurity: {
        handlers: {
          apiKey: async (req) => {
            const [type = '', token] = (req.headers.authorization || '').split(
              ' ',
            )

            req.user = {
              id: '1',
              name: 'test',
            }

            return (
              type.toLowerCase() === 'bearer' &&
              token === config.security.apiKey
            )
          },
        },
      },
    }),
  )

  app.use(createRouter([...logsRouter(globals), ...defaultRouter()]))

  app.use('/?*', () => {
    throw new HttpError(HttpStatusCodes.NOT_FOUND)
  })

  return app
}
