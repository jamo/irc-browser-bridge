import logger from 'winston'
import { ConfigurationError } from './error'
import irc from 'irc'

const REQUIRED_FIELDS = ['server', 'nick', 'channel']

class IrcBot {
  constructor (options, listener) {
    REQUIRED_FIELDS.forEach(field => {
      if (!options[field]) {
        throw new ConfigurationError('Missing configuration field ${field}')
      }
    })

    this.server = options.server
    this.nick = options.nick
    this.ircOptions = options.ircOptions || {}
    this.ircStatusNotices = options.ircStatusNotices || {}
    this.commandCharacters = options.commandCharacters || []
    this.channel = options.channel

    this.listener = listener
  }

  start () {
    this.listener('starting up')
    logger.debug('Bot starting up')

    this.connectToIRC()

    logger.debug('Ready to proxy from IRC')
  }

  connectToIRC() {
    const ircOptions = {
      userName: this.nick,
      realName: this.nick,
      channels: [this.channel],
      floodProtection: true,
      floodProtectionDelay: 500,
      autoRejoin: true,
      debug: true,
      showErrors: true
    }

    this.ircClient = new irc.Client(this.server, this.nick, ircOptions)
    this.attachIrcListeners()
  }

  attachIrcListeners () {
    logger.debug('attaching listeners')

    // Just log and ignore
    this.ircClient.addListener('error', (message) => {
      logger.debug('error: ', message)
    })

    this.ircClient.addListener('message', (from, to, message) => {
      logger.debug('Just message' + JSON.stringify(message))
      const timestamp = new Date()
      this.listener({time: timestamp, nick: from, message: message})
    })

    this.ircClient.addListener('pm', (from, message) => {
      logger.debug(from + ' => ME: ' + message)
    })

    // TODO: use per channel
    // this.ircClient.addListener('message#' + this.channel, (from, message) => {
    //   logger.debug(JSON.stringify(message))
    //   const timestamp = strftime('%H:%M')
    //   this.listener({timestamp: timestamp, nick: from, message: message})
    // })
  }

  // Message format:
  // listener({timestamp: timestamp, nick: from, message: message})
  emit (msg) {
    logger.debug('Saying to' + this.channel + ': ' + msg)
    this.ircClient.say(this.channel, '<' + msg.nick + '> ' + msg.message)
  }
}

export default IrcBot
