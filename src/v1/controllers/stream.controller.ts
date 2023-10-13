import { Globals } from '@config'
import { RouteResponse } from '@v1/services/openapi'
import streamService from '@v1/services/stream.service'

const getStream = async (globals: Globals, _req: any, res: RouteResponse<'getStream'>) => {
  const stream: {
    path: string,
    infos: any
  } = await streamService.startStream(globals)

  return res.json(stream)
}

export default {
  getStream,
}
