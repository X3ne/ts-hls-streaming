import { Response, Request, NextFunction } from 'express'
import { HttpError, Logger } from 'common-stuff'

export function handleApiErrors(
  logger: Logger,
): (err: unknown, req: Request, res: Response, next: NextFunction) => unknown {
  return (err, _req, res, next) => {
    if (err) {
      if (err instanceof HttpError) {
        logger.warn(`${err.status} error: ${err.message}`)
        return res.status(err.status).json({
          error: err.message,
        })
      } else if (err instanceof Error && 'status' in err) {
        const status = (err as any).status
        const message = (err as any).message
        logger.warn(`${status} error: ${message}`)
        return res.status(status).json({
          error: message,
        })
      } else if (String(err).includes('JSON at position')) {
        logger.warn(String(err))
        res.status(400).json({
          error: 'invalid JSON',
        })
      } else {
        logger.error(String(err))
        return res.status(500).json({
          error: 'unknown error',
        })
      }
    }
    next(err)
  }
}
