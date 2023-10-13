import { Globals } from '@config'

const startStream = async ({ transcoder, config }: Globals) => {
  console.log('streaming')

  const videoPath = '/home/arthur/dev/ts-torrents-api/videos/test.mkv'


  const job = transcoder.getJob(videoPath)
  if (job) {
    const fileInfos = await job.getFileInfos()

    return {
      path: job.transcodePath.replace(config.transcoder.transcodePath, `http://${config.host}:${config.port}/api/v1`) + '/output.m3u8',
      infos: fileInfos
    }
  }

  const newJob = transcoder.createJob(videoPath)

  const fileInfos = await newJob.getFileInfos()

  console.log(newJob)


  const path = await newJob.start()

  console.log(path)

  return {
    path: path.replace(config.transcoder.transcodePath, `http://${config.host}:${config.port}/api/v1`),
    infos: fileInfos
  }
}

export default {
  startStream,
}
