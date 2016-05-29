import logger from 'winston'
import ChatBinder from './chatbinder'

if (process.env.NODE_ENV === 'development') {
  logger.level = 'debug'
  logger.info('Logging in debug level')
}

const ircOpts = {
  server: '',
  nick: '',
  channel: '#'
}

const chatBinder = new ChatBinder(ircOpts, 3000)
chatBinder.start()
