import { Globals } from '@config'
import { createRoute, Route } from '@v1/services/openapi'

export function logsRouter({ logStorage }: Globals): Route[] {
  return [
    createRoute('getLogs', (_req, res) => {
      return res.json(logStorage.get())
    }),
  ]
}
