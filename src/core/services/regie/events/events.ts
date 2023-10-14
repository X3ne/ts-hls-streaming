enum RegieEvents {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  NEXT = 'next',
  PREVIOUS = 'previous',
  SEEK = 'seek',
  SUBTITLES = 'subtitles',
  AUDIO = 'audio',
  QUALITY = 'quality',
}

interface RegieEvent {
  name: RegieEvents
  data: any
}

const play = (event: RegieEvent) => {
  console.log('play', event)
}

const pause = (event: RegieEvent) => {
  console.log('pause', event)
}

export {
  play,
  pause,
  RegieEvent
}
