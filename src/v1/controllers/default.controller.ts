import { RouteRequest, RouteResponse } from '@v1/services/openapi'
import defaultService from '@v1/services/default.service'

const getDefault = async (_req: any, res: RouteResponse<'getDefault'>) => {
  return res.json(await defaultService.getDefault())
}

const postDefault = async (
  req: RouteRequest<'postDefault'>,
  res: RouteResponse<'postDefault'>,
) => {
  const result = await defaultService.createDefault(req.body)
  return res.json(result)
}

const patchDefault = async (
  req: RouteRequest<'patchDefault'>,
  res: RouteResponse<'patchDefault'>,
) => {
  const result = await defaultService.updateDefault(req.body)
  return res.json(result)
}

const deleteDefault = async (
  _req: any,
  res: RouteResponse<'deleteDefault'>,
) => {
  return res.json(await defaultService.deleteDefault())
}

export default {
  getDefault,
  postDefault,
  patchDefault,
  deleteDefault,
}
