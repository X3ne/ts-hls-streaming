import { Namespace, Server, Socket } from 'socket.io'

enum StreamStatus {
  PLAY = 'play',
  PAUSE = 'pause',
}

interface Stream {
  id: number
  name: string
  status: StreamStatus
  path: string
  progress: number
  client: Socket
}

export class Regie {
  private io: Namespace
  private streams: Stream[] = []

  constructor(server: Server) {
    this.io = server.of('/regie')

    console.log('regie started')

    this.init()
  }

  init() {
    this.io.on('connection', (socket) => {
      console.log('a user connected to regie')

      if (!this.getStream(1)) {
        this.addStream({
          id: 1,
          name: 'test',
          status: StreamStatus.PAUSE,
          path: 'test',
          progress: 0,
          client: socket,
        })
      }

      socket.on('play', ({ id }: { id: number }) => this.onPlay(id))
      socket.on('pause', ({ id }: { id: number }) => this.onPause(id))
      socket.on('stop', ({ id }: { id: number }) => this.onStop(id))
      socket.on('progress', ({ id, progress }: { id: number, progress: number }) => this.onProgress(id, progress))
      socket.on('seek', ({ id, progress }: { id: number, progress: number }) => this.onSeek(id, progress))

      socket.on('disconnect', () => {

        this.removeStream(1)

        console.log('user disconnected from regie')
      })
    })
  }

  getStreams() {
    return this.streams
  }

  getStream(id: number) {
    return this.streams.find((stream) => stream.id === id)
  }

  addStream(stream: Stream) {
    this.streams.push(stream)
  }

  updateStream(id: number, stream: Stream) {
    const index = this.streams.findIndex((stream) => stream.id === id)
    this.streams[index] = stream
  }

  removeStream(id: number) {
    this.streams = this.streams.filter((stream) => stream.id !== id)
  }

  private onPlay(id: number) {
    console.log('play', id)

    const stream = this.getStream(id)

    if (!stream) {
      return
    }

    this.updateStream(id, {
      ...stream,
      status: StreamStatus.PLAY,
    })

    this.emitStreamUpdate(id)
  }

  private onPause(id: number) {
    console.log('pause', id)

    const stream = this.getStream(id)

    if (!stream) {
      return
    }

    this.updateStream(id, {
      ...stream,
      status: StreamStatus.PAUSE,
    })

    this.emitStreamUpdate(id)
  }


  private onStop(id: number) {
    console.log('stop', id)

    this.removeStream(id)

    this.io.emit('remove', id)
  }

  private onProgress(id: number, progress: number) {
    console.log('progress', id, progress)

    const stream = this.getStream(id)

    if (!stream) {
      return
    }

    this.updateStream(id, {
      ...stream,
      progress,
    })

    this.emitStreamUpdate(id)
  }

  private onSeek(id: number, progress: number) {
    console.log('seek', id, progress)

    const stream = this.getStream(id)

    if (!stream) {
      return
    }

    this.updateStream(id, {
      ...stream,
      progress
    })

    this.emitStreamUpdate(id)
  }

  private emitStreamUpdate(id: number) {
    const stream = this.getStream(id)

    if (!stream) {
      console.log('stream not found')

      return
    }


    const { client, ...streamData } = stream

    console.log('emit update to', client.id, 'for stream', streamData.id)

    client.emit('update', streamData)
  }
}
