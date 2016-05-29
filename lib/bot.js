import logger from 'winston'
import { ConfigurationError } from './error'
import irc from 'irc'

const REQUIRED_FIELDS = ['server', 'nick', 'channel']

class Bot {
  constructor(options) {
    REQUIRED_FIELDS.forEach(field => {
      if (!options[field]) {
        throw new ConfigurationError('Missing configuration field ${field}')
      }
    });

    this.server = options.server
    this.nick = options.nick
    this.ircOptions = options.ircOptions || {}
    this.ircStatusNotices = options.ircStatusNotices || {}
    this.commandCharacters = options.commandCharacters || []
    this.channel = options.channel
  }

  start() {
    logger.debug('Bot starting up')

    // Connect to irc
    this.connectToIRC()
    // Connect start socketIO
    // start proxying
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
    console.log("asd")
    this.proxyMessages()
  }

  proxyMessages() {
    logger.debug('attaching listeners')
    this.ircClient.addListener('error', function(message) {
      logger.debug('error: ', message)
    })

    this.ircClient.addListener('message', function(from, to, message) {
      logger.debug(JSON.stringify(message))
      // var timestamp = strftime('%H:%M');
      // io.emit('chat messages', {timestamp: timestamp, from: from, to: to, message: message});
    })
    this.ircClient.addListener('message#' + this.channel, function(from, to, message) {
      logger.debug(JSON.stringify(message))
      // var timestamp = strftime('%H:%M');
      // io.emit('chat messages', {timestamp: timestamp, from: from, to: to, message: message});
    })
    client.addListener('pm', function (from, message) {
      console.log(from + ' => ME: ' + message);
    });

  }
}

export default Bot
