import { Globals } from '@config'
import streamController from '@v1/controllers/stream.controller'
import { createRoute, Route } from '@v1/services/openapi'

export function streamRouter(globals: Globals): Route[] {
  return [
    createRoute('getStream', (req, res) => {
      return streamController.getStream(globals, req, res)
    }),
  ]
}
