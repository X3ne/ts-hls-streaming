import defaultController from '@v1/controllers/default.controller'
import { createRoute, Route } from '@v1/services/openapi'

export function defaultRouter(): Route[] {
  return [
    createRoute('getDefault', (req, res) => {
      return defaultController.getDefault(req, res)
    }),

    createRoute('postDefault', (req, res) => {
      return defaultController.postDefault(req, res)
    }),

    createRoute('patchDefault', (req, res) => {
      return defaultController.patchDefault(req, res)
    }),

    createRoute('deleteDefault', (req, res) => {
      return defaultController.deleteDefault(req, res)
    }),
  ]
}
