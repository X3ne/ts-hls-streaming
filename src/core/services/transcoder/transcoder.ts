import { config } from '@config'
import { Job } from './job'
import fs from 'fs'

export class Transcoder {
  jobs: Job[] = []

  constructor() {
    console.log('transcoder started')

    this.init()
  }

  init() {
    if (!fs.existsSync(config.transcoder.transcodePath)) {
      fs.mkdirSync(config.transcoder.transcodePath)
    } else {
      fs.rmdirSync(config.transcoder.transcodePath, { recursive: true })
      fs.mkdirSync(config.transcoder.transcodePath)
    }
  }

  getRuningJob() {
    return this.jobs.filter((job) => job.status !== 'done')
  }

  getJob(path: string) {
    return this.jobs.find((job) => job.filePath === path)
  }

  createJob(path: string) {
    const runningJob = this.getRuningJob()
    if (runningJob.length >= config.transcoder.maxJobs) {
      throw new Error('Maximum number of jobs reached')
    }

    const job = this.getJob(path)

    if (job) {
      return job
    }

    const newJob = new Job(path)

    this.jobs.push(newJob)

    return newJob
  }
}
