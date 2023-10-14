import express from 'express'
import cors from 'cors'
import { Logger } from 'common-stuff'
import { createHttpTerminator } from 'http-terminator'
import rateLimit from 'express-rate-limit'
import bodyParser from 'body-parser'
import compression from 'compression'
import responsetime from 'response-time'
import helmet from 'helmet'
import { Server } from 'socket.io'
import http from 'http'

import * as dotenv from 'dotenv'
import { expand } from 'dotenv-expand'

const envs = dotenv.config({ path: __dirname + '/../.env' })
expand(envs)

import { readConfig, Config, Globals } from '@config'
import { audit, createLogger, LogsStorage } from '@services/logging'
import { getApiRouter as getApiV1Router } from '@v1/routes'

import 'express-async-errors'
import { handleApiErrors } from '@helpers/errors'
import { Transcoder } from '@services/transcoder'
import { Regie } from '@services/regie'

export interface AppOptions {
  config?: Partial<Config>
  transcoder?: Transcoder
  regie?: Regie
  logger?: Logger
}

let server: http.Server

export function createApp(options?: AppOptions): Globals {
  const config = readConfig(options?.config)
  if (config.environment === 'development') {
    console.log(config)
  }
  const logStorage = new LogsStorage({
    limit: config.logging.storeLimit,
  })
  const logger = options?.logger
    ? options.logger
    : createLogger(config, logStorage)

  const transcoder = new Transcoder()

  const app = express()
  server = http.createServer(app)

  const ioServer = new Server(server)
  const regie = new Regie(ioServer)

  app.use(responsetime())

  app.use(cors())
  app.use(helmet())

  app.set('etag', false)

  app.use(compression())

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

  if (config.trustProxy) {
    app.set('trust proxy', true)
  }

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: config.security.rpm,
    }),
  )

  app.use(audit)

  app.use(
    '/api/v1',
    getApiV1Router({
      config,
      transcoder,
      regie,
      logger,
      logStorage,
      app,
    }),
  )

  app.use(handleApiErrors(logger))

  return { app, logger, transcoder, regie, config, logStorage }
}

export function createAndRunApp(): Globals {
  const { app, config, logger, transcoder, regie, logStorage } = createApp()

  server.listen(config.port, config.host, () => {
    const accessHost =
      config.host === ('0.0.0.0' || 'localhost') ? '127.0.0.1' : config.host

    logger.info(
      [
        'Server running',
        `   - Host: ${accessHost}`,
        `   - Port ${config.port}`,
        `   - Trust proxy: ${config.trustProxy}`,
        `Url: http://${accessHost}:${config.port}`,
      ].join('\n'),
    )
  })

  const httpTerminator = createHttpTerminator({
    server,
  })

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info(`${signal} signal received, closing server`)

    try {
      await httpTerminator.terminate()
    } catch (err) {
      logger.warn(`Error while terminating HTTP server: ${err}`)
    }

    process.exit()
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  return { app, config, logger, transcoder, regie, logStorage }
}
