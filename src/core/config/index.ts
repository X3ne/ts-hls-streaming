import { Logger, merge, convertToNested, camelCase } from 'common-stuff'
import { z } from 'zod'
import { Express } from 'express'

import { LogsStorage } from '../services/logging'
import { Transcoder } from '@services/transcoder'

export enum Environment {
  Production = 'production',
  Development = 'development',
}

const configSchema = z.object({
  host: z.string(),
  port: z.number(),
  frontendUrl: z.string(),
  environment: z.nativeEnum(Environment),
  logging: z.object({
    transports: z.array(
      z.object({
        type: z.literal('console'),
      }),
    ),
    level: z.enum(['debug', 'info', 'warn', 'error']),
    storeLimit: z.number().nonnegative(),
  }),
  transcoder: z.object({
    maxJobs: z.number().nonnegative(),
    transcodePath: z.string(),
  }),
  security: z.object({
    apiKey: z.string(),
    rpm: z.number(),
  }),
  trustProxy: z.boolean(),
})

export type Config = z.infer<typeof configSchema>

const parsedEnv = convertToNested(process.env, {
  separator: '__',
  transformKey: camelCase,
})

const defaultConfig: Config = {
  host: (parsedEnv.host as any) || '0.0.0.0',
  port: (parsedEnv.port as any) || 3030,
  frontendUrl: (parsedEnv.frontendUrl as any) || 'http://localhost:3000',
  environment:
    parsedEnv.nodeEnv === Environment.Development
      ? Environment.Development
      : Environment.Production,
  trustProxy: !!parsedEnv.trustProxy,
  logging: {
    transports: [
      {
        type: 'console',
      },
    ],
    level: 'info',
    storeLimit: 100,
  },
  transcoder: {
    maxJobs: (parsedEnv.maxJobs as any) || 1,
    transcodePath: (parsedEnv.transcodePath as any) || '/tmp/transcode',
  },
  security: {
    apiKey: parsedEnv.apiKey as any,
    rpm: 300,
  },
}

export function readConfig(overwrites?: Partial<Config>): Config {
  try {
    return configSchema.parse(
      merge(
        merge(defaultConfig, (parsedEnv.config || undefined) ?? {}),
        overwrites ?? {},
      ),
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map((v) => `${v.message} @ ${v.path.join('.')}`)
      throw Error(`Configuration error: ${errors.join(', ')}`)
    }
    throw Error(`Configuration error: ${err}`)
  }
}

export const config = readConfig()

export interface Globals {
  config: Config
  logger: Logger
  logStorage: LogsStorage
  transcoder: Transcoder
  app: Express
}
