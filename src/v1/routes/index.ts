import { Router } from 'express'
import { HttpError, HttpStatusCodes } from 'common-stuff'
import { middleware } from 'express-openapi-validator'
import swaggerUi from 'swagger-ui-express'

import { Globals } from '@config'
import { logsRouter } from './logs'
import { streamRouter } from './stream'
import { createRouter, openapi } from '@v1/services/openapi'
import express from 'express'

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

  console.log('service streams from', config.transcoder.transcodePath)

  app.use(express.static(config.transcoder.transcodePath))
  app.use('/test', express.static('/home/arthur/dev/ts-torrents-api/videos'))

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

  app.use(createRouter([...logsRouter(globals), ...streamRouter(globals)]))

  app.use('/?*', () => {
    throw new HttpError(HttpStatusCodes.NOT_FOUND)
  })

  return app
}
