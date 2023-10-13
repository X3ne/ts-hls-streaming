import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg'
import { config } from '@config'
import fs from 'fs'

const jobs = []

export enum JobStatus {
  STARTING = 'starting',
  PENDING = 'pending',
  STARTED = 'started',
  TRANSCODING = 'transcoding',
  REMUXING = 'remuxing',
  DONE = 'done',
  ERROR = 'error',
}

export class Job {
  id: number
  filePath: string
  transcodePath: string
  status: string
  process: FfmpegCommand | null = null

  constructor(path: string) {
    this.id = jobs.length + 1
    this.filePath = path
    this.transcodePath = config.transcoder.transcodePath + '/' + this.id
    this.status = JobStatus.STARTING
  }

  async getFileInfos() {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(this.filePath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }

        resolve(metadata)
      })
    })
  }

  async start(): Promise<string> {
    this.status = JobStatus.PENDING

    if (!fs.existsSync(this.transcodePath)) {
      fs.mkdirSync(this.transcodePath)
    }

    this.process = this.transcode()

    this.process.run()

    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject('No process found')
        return
      }

      this.process.on('error', (err, stdout, stderr) => {
        console.log('An error occurred: ' + err.message)
        console.log('ffmpeg stdout: ' + stdout)
        console.log('ffmpeg stderr: ' + stderr)
        reject(err)
      })

      this.process.on('start', () => {
        console.log('Processing started !')
        this.status = JobStatus.STARTED
        resolve(config.transcoder.transcodePath + '/' + this.id + '/output.m3u8')
      })
    })
  }

  private done() {
    this.status = JobStatus.DONE
  }

  private error() {
    this.status = JobStatus.ERROR
  }

  private transcode() {
    const outPath = config.transcoder.transcodePath + '/' + this.id

    const process = ffmpeg()
      .input(this.filePath)
      .addOption('-map', '0')
      .addOption('-c:v', 'copy')
      .addOption('-c:a', 'aac')
      .addOption('-strict', 'experimental')
      .addOption('-f', 'hls')
      .addOption('-hls_time', '10')
      .addOption('-hls_list_size', '0')
      .addOption('-hls_segment_filename', outPath + '/output%d.ts')
      .addOption('-hls_flags', 'delete_segments')
      .addOption('-threads', '0')
      .addOption('-preset', 'ultrafast')
      .addOption('-tune', 'zerolatency')
      .addOption('-copyts')
      .addOption('-start_number', '0')
      .output(outPath + '/output.m3u8')
      .on('error', (err, stdout, stderr) => {
        console.log('An error occurred: ' + err.message)
        console.log('ffmpeg stdout: ' + stdout)
        console.log('ffmpeg stderr: ' + stderr)
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done')
        this.status = JobStatus.TRANSCODING
      })
      .on('end', () => {
        console.log('Processing finished !')
        this.status = JobStatus.DONE
      })

    return process
  }

  pause() {
    this.status = JobStatus.PENDING

    this.process?.kill('SIGSTOP')
  }

  resume() {
    this.status = JobStatus.PENDING

    this.process?.kill('SIGCONT')
  }

  kill() {
    this.status = JobStatus.PENDING

    console.log('killing', this.id)

    this.process?.kill('SIGKILL')
  }
}
