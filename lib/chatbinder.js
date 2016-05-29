import logger from 'winston'

import IrcBot from './ircbot'
import SocketIoConnection from './socketioconnection'

class ChatBinder {
  constructor (ircOpts, port) {
    this.ircBot = new IrcBot(ircOpts, (msg) => {
      logger.warn('1')
      logger.debug('got ' + JSON.stringify(msg) + ' from bot and proxying it to socketio')
      this.socketIoConnection.emit(msg)
    })
    this.socketIoConnection = new SocketIoConnection(port || 3000, (msg) => {
      logger.debug('got ' + JSON.stringify(msg) + ' from socketIo and proxying it to bot')
      this.ircBot.emit(msg)
    })
  }

  start () {
    this.ircBot.start()
    this.socketIoConnection.start()
  }
}

export default ChatBinder
// Message format:
// listener({timestamp: timestamp, nick: from, message: message})
