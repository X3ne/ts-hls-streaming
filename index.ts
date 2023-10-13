import express from 'express'
import http from 'http'
import { JobStatus, Transcoder } from './transcoder'
import { config } from './config'

const app = express()
const server = http.createServer(app)
const transcoder = new Transcoder()

const PORT = process.env.PORT || 3003

app.use(express.static('public'))
const videoPath = './videos/test.mkv'

app.use(express.static(config.transcodePath))

app.get('/stream', async (req, res) => {
  console.log('streaming')


  const job = transcoder.createJob(videoPath)

  const fileInfos = await job.getFileInfos()

  console.log(job)

  if (job.status !== JobStatus.STARTING) {
    return res.json({
      path: job.transcodePath.replace(config.transcodePath, '') + '/output.m3u8',
      infos: fileInfos
    })
  }

  const path = await job.start()

  console.log(path)

  return res.json({
    path: path.replace(config.transcodePath, ''),
    infos: fileInfos
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
