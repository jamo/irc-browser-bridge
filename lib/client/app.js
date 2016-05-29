import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
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
              { this.props.messages.map(msg => <ListItemWrapper key={msg.id} data={msg}/>) }
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
    console.log(message);
    if (!message || !nick) {
      return;
    }
    this.setState({message: ''});
    // TODO: push to socket.io
    this.props.onSubmit({nick: nick, message: message, id: new Date()})
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
      messages: [ {nick: 'Jamo', message: 'Moi', id: 1}, {nick: 'Arto', message: 'Moi Jamo', id: 2}, {nick: 'hn', message: 'Moi Arto ja Jamo', id: 3} ]
    };
  }

  onSubmit(e) {
    console.log(e);
    this.setState({messages: this.state.messages.concat([e])})
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
ReactDOM.render(<IrcApp />, mountNode);
