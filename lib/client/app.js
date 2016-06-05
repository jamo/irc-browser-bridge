import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import strftime from 'strftime'
import nickGen from 'nick-generator'
import io from 'socket.io-client'
import './app.css'
import styles from './styles.module.css'

class MessageList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidUpdate() {
    console.log(ReactDOM.findDOMNode(this.refs.bottom))
    const messages = ReactDOM.findDOMNode(this.refs.messages)

    const nowScrolledTo = messages.offsetHeight + messages.scrollTop
    const hasScrolledUp = nowScrolledTo - messages.scrollHeight < -120
    console.log([nowScrolledTo, messages.scrollHeight, nowScrolledTo - messages.scrollHeight])
    if (!hasScrolledUp) {
      ReactDOM.findDOMNode(this.refs.bottom).scrollIntoView()
    }
  }

  render() {
    return(
          <div className={styles['messages']} ref='messages'>
            { this.props.messages.map(msg =>
              <div key={msg.time+msg.message}
                   className={styles['row']}
              >
                <div className={styles[this.props.nick === msg.nick ? 'me' : 'other']}>
                   <p className={styles['author']}>
                     {msg.nick}
                   </p>
                   <p className={styles['message']}>
                     {msg.message}
                    </p>
                </div>
              </div>
            ) }
            <a ref="bottom" />
          </div>
        )
  }
}

class MessageForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nick: this.props.nick,
      message: ''
    }
  }

  handleNickChange = (e) => {
    this.setState({nick: e.target.value})
  }

  handleMessageChange = (e) => {
    this.setState({message: e.target.value})
  }

  handleInputEvents = (e) => {
  }

  handleOnKeyUp = (e) => {
    const snap = {
      key: e.key,
      cursorLocation: e.target.selectionStart
    }
    if (e.key.length > 1) {
     snap.value = e.target.value
    }
    // TODO: log properly
    console.log(snap)
  }

  handleSubmit = (e) => {
    e.preventDefault()
    var nick = this.state.nick.trim()
    var message = this.state.message.trim()
    if (!message || !nick) {
      return
    }
    this.setState({message: ''})
    this.props.onSubmit({nick: nick, message: message, time: new Date()})
    ReactDOM.findDOMNode(this.refs.messageForm).scrollIntoView()
  }

  render() {
    return(
          <form className={styles['messageForm']} onSubmit={this.handleSubmit} ref="messageForm">
              <input type="text"
                value={this.state.nick}
                onChange={this.handleNickChange}
                id={styles['formAuthor']}
              />
              <input type="text" placeholder="Message..."
                value={this.state.message}
                onChange={this.handleMessageChange}
                onInput={this.handleInputEvents}
                onKeyUp={this.handleOnKeyUp}
                id={styles['formMessage']}
              />
              <input type="submit" value="Send" id={styles['formSubmit']} />
          </form>
        )
  }
}
class IrcApp extends React.Component {

  constructor(props) {
    super(props)
    const socketio = io.connect(this.props.iourl)
    this.state = {
      messages: [
      {nick: 'Jamo', message: 'Moi asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd ', time: new Date('2014')},
      {nick: 'Jamo', message: 'Moi asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asssd ', time: new Date('2014')},
      {nick: 'Jamo', message: 'LOL :Moi asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asssd ', time: new Date('2014')},
      {nick: 'Arto', message: 'Moi Jamo', time: new Date('2015')},
      {nick: 'hn', message: 'Moi Arto ja Jamo', time: new Date('2016')} ],
      nick: nickGen(),
      socketio: socketio
    }

    this.state.socketio.on('connect', function () {
      console.log('connect')
    })
    this.state.socketio.on('message', function (data) {
      console.log('message')
      console.log(data)
    })

    this.state.socketio.on('messages', function (message) {
      console.log('messages')
      console.log(message)
      irc.newMessage(message)
    })
  }

  newMessage(message) {
    this.setState({messages: this.state.messages.concat([message])})
  }

  onSubmit(message) {
    console.log(message)
    this.setState({messages: this.state.messages.concat([message])})
    this.setState({nick: message.nick})
    this.state.socketio.emit('message', message)
  }

  render() {
    return (
            <div className={styles['flexContainer']}>
              <MessageList
                messages={this.state.messages}
                nick={this.state.nick}
              />
              <MessageForm
                messages={this.state.messages}
                onSubmit={this.onSubmit.bind(this)}
                nick={this.state.nick}
              />
            </div>
          )
  }
}

const mountNode = document.querySelector('#root')
const irc = ReactDOM.render(<IrcApp iourl="http://127.0.0.1:3001"/>, mountNode)

