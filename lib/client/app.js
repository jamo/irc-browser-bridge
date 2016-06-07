import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import strftime from 'strftime'
import nickGen from 'nick-generator'
import io from 'socket.io-client'
import base64 from 'base-64'
import uuid from 'uuid'
import Spyware from 'tmc-analytics'
import './app.css'
import styles from './styles.module.css'

class MessageList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidUpdate() {
    const messages = ReactDOM.findDOMNode(this.refs.messages)

    const nowScrolledTo = messages.offsetHeight + messages.scrollTop
    const hasScrolledUp = nowScrolledTo - messages.scrollHeight < -120
    if (!hasScrolledUp) {
      ReactDOM.findDOMNode(this.refs.bottom).scrollIntoView()
    }
  }

  render() {
    return(
          <div className={styles['messages']} ref='messages'>
            { this.props.messages.map(msg =>
              <div key={uuid.v4()}
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

class LoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tmc: 'https://tmc.mooc.fi/staging/courses.json?api_version=7',
      username: '',
      password: '',
      loginFailed: false
    }
  }

  updateUsername = (e) => {
    this.setState({username: e.target.value})
  }

  updatePassword = (e) => {
    this.setState({password: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const username = this.state.username.trim()
    const password = this.state.password.trim()
    const tmc = this.state.tmc.trim()
    if (!username || !password || !tmc) {
      return
    }


    //fetch("http://127.0.0.1:8080", {
    //  method: 'post',
    //  body: new Buffer("ad\nasdad\n")
    //}).then((_,res)=>{console.log(res)})

    const headers = new Headers();
    headers.append("Authorization", "Basic " + base64.encode(username + ":" + password));
    fetch(tmc, {
      headers: headers
    }).then((response) => {
      if (response.status == 200) {
        response.json().then((body) => {
          const spyware = body.courses[0].spyware_urls[0]
          this.props.onLogin({username: username, password: password, tmc: tmc, spyware: spyware})
        })
      } else {
        this.setState({loginFailed: true})
      }
    })
  }

  render() {
    return(
          <form className={styles['login']} onSubmit={this.handleSubmit} ref="messageForm">
            <div className={styles['login-row']}>
              <h2>Please login with your tmc-credentials</h2>
              {this.state.loginFailed ? <p className={styles['error']}>Login failed.</p> : false}
            </div>
            <div className={styles['login-row']}>
              <input type="text"
                value={this.state.username}
                onChange={this.updateUsername}
              />
            </div>
            <div className={styles['login-row']}>
              <input type="password"
                value={this.state.password}
                onChange={this.updatePassword}
              />
            </div>
            <div className={styles['login-row']}>
              <input type="submit" value="Login" id={styles['formSubmit']} />
            </div>
            <p>We gather minor usage data; this may be used by the Rage Research group of University of Helsinki. However, only aggregated non idenifying results may be published</p>
          </form>
        )
  }
}

class MessageForm extends React.Component {
  constructor(props) {
    super(props)
    const cred = this.props.credentials
    this.state = {
      nick: this.props.nick,
      message: '',
      spyware: new Spyware(cred.username, cred.password, this.props.courseName, '', cred.spyware)
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
      idx: e.target.selectionStart
    }
    if (e.key.length > 1) {
     snap.text = e.target.value
     snap.full = true
    }
    this.state.spyware._ircEvent(snap)
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
    this.state.spyware._ircEvent({text: message, full: true, post: true})
    this.state.spyware.submit()
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
      {nick: 'MOOC.fi staff', message: 'Welcome to our new web irc client. This only works with the #mooc.fi @IRCnet', time: new Date('2016')}
      ],
      nick: nickGen(),
      socketio: socketio,
      loggedIn: false
    }

    this.state.socketio.on('connect', function () {
    })
    this.state.socketio.on('message', function (data) {
    })

    this.state.socketio.on('messages', function (message) {
      irc.newMessage(message)
    })
  }

  newMessage(message) {
    this.setState({messages: this.state.messages.concat([message])})
  }

  onSubmit(message) {
    this.setState({messages: this.state.messages.concat([message])})
    this.setState({nick: message.nick})
    this.state.socketio.emit('message', message)
  }

  onLogin(credentials) {
    this.setState({credentials: credentials})
    this.setState({loggedIn: true})
  }

  render() {
    return (
            <div className={styles['flexContainer']}>
              <MessageList
                messages={this.state.messages}
                nick={this.state.nick}
              />
            {this.state.loggedIn ?
              <MessageForm
                messages={this.state.messages}
                onSubmit={this.onSubmit.bind(this)}
                credentials={this.state.credentials}
                nick={this.state.nick}
                courseName="irc-demo"
              />
              :
              <LoginForm
                onLogin={this.onLogin.bind(this)}
              />
            }
            </div>
          )
  }
}

const mountNode = document.querySelector('#root')
const irc = ReactDOM.render(<IrcApp iourl="https://api.mooc-irc.tmchq.co"/>, mountNode)

