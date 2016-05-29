import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import strftime from 'strftime'
import io from 'socket.io-client'
import './app.css'

class ListItemWrapper extends React.Component{
  render() {
    return <li>{this.props.data.message}</li>;
  }
}

class MessageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return(
          <div>
            <ul>
              { this.props.messages.map(msg => <ListItemWrapper key={msg.time+msg.message} data={msg}/>) }
            </ul>
          </div>
        );
  }
}

class MessageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nick: 'RandomDude',
      message: ''
    };
  }

  handleNickChange = (e) => {
    this.setState({nick: e.target.value});
  }

  handleMessageChange = (e) => {
    this.setState({message: e.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    var nick = this.state.nick.trim();
    var message = this.state.message.trim();
    if (!message || !nick) {
      return;
    }
    this.setState({message: ''});
    // TODO: push to socket.io
    this.props.onSubmit({nick: nick, message: message, time: new Date()})
  }

  render() {
    return(
          <form className="messageForm" onSubmit={this.handleSubmit}>
            <input type="text" placeholder="Your name"
              value={this.state.nick}
              onChange={this.handleNickChange}
            />
            <input type="text" placeholder="Message..."
              value={this.state.message}
              onChange={this.handleMessageChange}
            />
            <input type="submit" value="Post" />
          </form>
        );
  }
}
class IrcApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [ {nick: 'Jamo', message: 'Moi', time: new Date('2014')}, {nick: 'Arto', message: 'Moi Jamo', time: new Date('2015')}, {nick: 'hn', message: 'Moi Arto ja Jamo', time: new Date('2016')} ]
    };
  }

  newMessage(message) {
    this.setState({messages: this.state.messages.concat([message])})
  }

  onSubmit(message) {
    console.log(message);
    this.setState({messages: this.state.messages.concat([message])})
    socketio.emit('message', message)
  }

  render() {
    return (
            <div>
              <MessageList messages={this.state.messages} />
              <MessageForm
                messages={this.state.messages}
                onSubmit={this.onSubmit.bind(this)} />
            </div>
          );
  }
}


const mountNode = document.querySelector('#root');
const irc = ReactDOM.render(<IrcApp />, mountNode);
const socketio = io.connect('http://localhost:3001');
socketio.on('connect', function () {
  console.log('connect')
});
socketio.on('message', function (data) {
  console.log('message');
  console.log(data);
});

socketio.on('messages', function (message) {
  console.log('messages');
  console.log(message);
  irc.newMessage(message);
});

