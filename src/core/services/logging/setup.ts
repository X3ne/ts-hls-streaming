import winston, { Logger } from 'winston'
import Transport from 'winston-transport'
import chalk from 'chalk'

import { Config } from '@config'
import { LogsStorage } from './storage'
import { NextFunction, Request, Response } from 'express'

export async function audit(req: Request, res: Response, next: NextFunction) {
  const methodColors = {
    GET: chalk.green,
    POST: chalk.magenta,
    PUT: chalk.yellow,
    PATCH: chalk.yellowBright,
    DELETE: chalk.red,
  }

  const statusColors = {
    200: chalk.green,
    201: chalk.green,
    204: chalk.green,
    400: chalk.yellow,
    401: chalk.yellow,
    403: chalk.yellow,
    404: chalk.yellow,
    405: chalk.yellow,
    409: chalk.yellow,
    500: chalk.red,
    502: chalk.red,
    503: chalk.red,
    504: chalk.red,
  }

  res.on('finish', () => {
    const method = req.method

    const url = req.originalUrl

    const status = res.statusCode

    const responsetime = res.get('X-Response-Time')

    try {
      console.log(
        methodColors[method as keyof typeof methodColors](`[${method}]`),
        url,
        statusColors[status as keyof typeof statusColors](status),
        responsetime,
      )
    } catch (err) {
      console.log(method, url, status, responsetime)
    }
  })
  next()
}

export function createLogger(config: Config, storage: LogsStorage): Logger {
  return winston.createLogger(getLoggerParams(config, storage))
}

const getLoggerParams = (config: Config, storage: LogsStorage) => ({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new LogsStorageTransport({}, storage),
  ],
  level: config.logging.level,
})

class LogsStorageTransport extends Transport {
  constructor(
    opts: Transport.TransportStreamOptions,
    protected storage: LogsStorage,
  ) {
    super(opts)
  }

  log(info: { message?: string; level?: string }, next: () => void) {
    const mappings = {
      emerg: 'error',
      alert: 'error',
      crit: 'error',
      error: 'error',
      warning: 'warn',
      warn: 'warn',
      notice: 'info',
      info: 'info',
      debug: 'debug',
    } as const
    if (info.message && info.level) {
      this.storage.add({
        message: info.message,
        level: mappings[info.level as keyof typeof mappings] || 'error',
        time: Date.now() / 1000,
      })
    }
    next()
  }
}
