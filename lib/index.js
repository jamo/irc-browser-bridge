import logger from 'winston'
import Bot from './bot'

if (process.env.NODE_ENV === 'development') {
  logger.level = 'debug'
  logger.info("Logging in debug level")
}

const bot = new Bot({
})

bot.start()
