import logger from 'winston'
import express from 'express'
import bodyParser from 'body-parser'
import strftime from 'strftime'

class SocketIoConnection {
  constructor (port, listener) {
    this.port = port
    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    this.http = require('http').Server(app)
    this.io = require('socket.io')(this.http)
    this.listener = listener
  }

  start () {
    logger.debug('Setting up server')
    this.http.listen(this.port, () => {
      logger.debug('listening on *:', this.port)
    })
    logger.debug('Done')

    this.io.on('connection', (socket) => {
      socket.on('message', (msg) => {
        logger.debug('Got message from socketIO: ' + msg)
        msg.timestamp = strftime('%H:%M')
        socket.emit('messages', msg)
        try {
          this.listener(msg)
        } catch (err) {
          logger.warn(err)
        }
      })
    })
  }

  // Message format:
  // listener({timestamp: timestamp, nick: from, message: message})
  emit (msg) {
    logger.debug('Emitting message (sockeIOConnection#emit) ' + msg)
    this.io.emit('messages', msg)
  }
}

export default SocketIoConnection
