import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import strftime from 'strftime'
import io from 'socket.io-client'
import './app.css'
import styles from './styles.module.css'

class MessageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidUpdate() {
    console.log(ReactDOM.findDOMNode(this.refs.bottom));
    const messages = ReactDOM.findDOMNode(this.refs.messages);

    const nowScrolledTo = messages.offsetHeight + messages.scrollTop;
    const hasScrolledUp = nowScrolledTo - messages.scrollHeight < -120
    console.log([nowScrolledTo, messages.scrollHeight, nowScrolledTo - messages.scrollHeight])
    if (!hasScrolledUp) {
      ReactDOM.findDOMNode(this.refs.bottom).scrollIntoView();
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
        );
  }
}

class MessageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nick: this.props.nick,
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
    ReactDOM.findDOMNode(this.refs.messageForm).scrollIntoView();
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
                id={styles['formMessage']}
              />
              <input type="submit" value="Send" id={styles['formSubmit']} />
          </form>
        );
  }
}
class IrcApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [
      {nick: 'Jamo', message: 'Moi asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd ', time: new Date('2014')},
      {nick: 'Jamo', message: 'Moi asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asssd ', time: new Date('2014')},
      {nick: 'Jamo', message: 'LOL :Moi asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asd  asd asd asd asd asd asd asd asd asd asd asd asd asd asssd ', time: new Date('2014')},
      {nick: 'Arto', message: 'Moi Jamo', time: new Date('2015')},
      {nick: 'hn', message: 'Moi Arto ja Jamo', time: new Date('2016')} ],
      nick: this.getFunnyNick()
    };
  }

  newMessage(message) {
    this.setState({messages: this.state.messages.concat([message])})
  }

  onSubmit(message) {
    console.log(message);
    this.setState({messages: this.state.messages.concat([message])})
    this.setState({nick: message.nick})
    socketio.emit('message', message)
  }

  getFunnyNick() {
    // TODO check local storage...
    const adj = ['adorable', 'amazing', 'beautiful', 'brave', 'calm', 'careful', 'classical', 'clean', 'confident', 'delightful', 'drunk', 'eager', 'efficient', 'electronic', 'elegant', 'faithful', 'famous', 'fancy', 'fresh', 'futuristic', 'gentle', 'glamorous', 'handsome', 'happy', 'helpful', 'hungry', 'illegal', 'impressive', 'jolly', 'kind', 'lively', 'logical', 'magnificent', 'nice', 'ordinary', 'perfect', 'practical', 'pragmatic', 'proud', 'rare', 'reasonable', 'rich', 'senior', 'silly', 'smooth', 'sparkling', 'suspicious', 'technical', 'thankful', 'unusual', 'valuable', 'witty', 'wonderful', 'zealous', 'wicked', 'pleasant', 'sunny', 'snowy'];
    const bird = ['Abyssinian', 'Affenpinscher', 'Afghan Hound', 'African Bush Elephant', 'African Civet', 'African Clawed Frog', 'African Forest Elephant', 'African Palm Civet', 'African Penguin', 'African Tree Toad', 'African Wild Dog', 'Albatross', 'Aldabra Giant Tortoise', 'Alligator', 'Angelfish', 'Ant', 'Anteater', 'Antelope', 'Arctic Fox', 'Arctic Hare', 'Arctic Wolf', 'Armadillo', 'Asian Elephant', 'Asian Palm Civet', 'Australian Mist', 'Avocet', 'Axolotl', 'Aye Aye', 'Baboon', 'Bactrian Camel', 'Badger', 'Balinese', 'Banded Palm Civet', 'Bandicoot', 'Barn Owl', 'Barnacle', 'Barracuda', 'Basking Shark', 'Bat', 'Bear', 'Beaver', 'Bengal Tiger', 'Bird', 'Bison', 'Black Bear', 'Black Rhinoceros', 'Bobcat', 'Bornean Orang-utan', 'Borneo Elephant', 'Bottle Nosed Dolphin', 'Brown Bear', 'Budgerigar', 'Buffalo', 'Bumble Bee', 'Burrowing Frog', 'Butterfly', 'Camel', 'Capybara', 'Caracal', 'Cassowary', 'Caterpillar', 'Catfish', 'Centipede', 'Chameleon', 'Cheetah', 'Chinchilla', 'Chinook', 'Chinstrap Penguin', 'Chipmunk', 'Cichlid', 'Clouded Leopard', 'Coati', 'Collared Peccary', 'Common Buzzard', 'Common Frog', 'Coral', 'Cougar', 'Cow', 'Coyote', 'Crane', 'Crested Penguin', 'Crocodile', 'Cross River Gorilla', 'Curly Coated Retriever', 'Cuttlefish', 'Dachshund', 'Dalmatian', 'Deer', 'Dhole', 'Discus', 'Dolphin', 'Dormouse', 'Dragonfly', 'Duck', 'Dugong', 'Dusky Dolphin', 'Dwarf Crocodile', 'Dwarf Fortress', 'Dragon', 'Eagle', 'Earwig', 'Eastern Gorilla', 'Echidna', 'Edible Frog', 'Egyptian Mau', 'Electric Eel', 'Elephant', 'Elephant Seal', 'Emperor Penguin', 'Emperor Tamarin', 'Emu', 'Falcon', 'Fennec Fox', 'Ferret', 'Fishing Cat', 'Flamingo', 'Flying Squirrel', 'Fox', 'Frigatebird', 'Frog', 'Fur Seal', 'Galapagos Penguin', 'Galapagos Tortoise', 'Gentoo Penguin', 'Geoffroys Tamarin', 'Gerbil', 'German Pinscher', 'Giant Clam', 'Gibbon', 'Giraffe', 'Goat', 'Golden Lion Tamarin', 'Goose', 'Gopher', 'Grasshopper', 'Grey Reef Shark', 'Grey Seal', 'Grizzly Bear', 'Guinea Fowl', 'Guinea Pig', 'Guppy', 'Hammerhead Shark', 'Hamster', 'Hare', 'Harrier', 'Havanese', 'Hedgehog', 'Heron', 'Howler Monkey', 'Humboldt Penguin', 'Hummingbird', 'Humpback Whale', 'Hyena', 'Iguana', 'Impala', 'Jackal', 'Jaguar', 'Kakapo', 'Kangaroo', 'King Penguin', 'Kingfisher', 'Kiwi', 'Koala', 'Komodo Dragon', 'Kudu', 'Ladybird', 'Lemming', 'Leopard', 'Liger', 'Lion', 'Lionfish', 'Little Penguin', 'Lizard', 'Lynx', 'Macaroni Penguin', 'Macaw', 'Magellanic Penguin', 'Magpie', 'Maine Coon', 'Malayan Civet', 'Malayan Tiger', 'Maltese', 'Manatee', 'Mandrill', 'Manta Ray', 'Markhor', 'Masked Palm Civet', 'Mastiff', 'Mayfly', 'Meerkat', 'Millipede', 'Mongrel', 'Monitor Lizard', 'Monkey', 'Monte Iberia Eleuth', 'Moorhen', 'Moose', 'Moray Eel', 'Moth', 'Mountain Lion', 'Mouse', 'Newt', 'Nightingale', 'Ocelot', 'Octopus', 'Okapi', 'Opossum', 'Ostrich', 'Otter', 'Oyster', 'Pademelon', 'Panther', 'Parrot', 'Peacock', 'Pekingese', 'Pelican', 'Penguin', 'Pheasant', 'Pied Tamarin', 'Pink Fairy Armadillo', 'Piranha', 'Platypus', 'Pointer', 'Polar Bear', 'Pond Skater', 'Poodle', 'Porcupine', 'Possum', 'Prawn', 'Puffer Fish', 'Puffin', 'Pug', 'Puma', 'Purple Emperor', 'Quail', 'Quetzal', 'Quokka', 'Quoll', 'Rabbit', 'Raccoon', 'Radiated Tortoise', 'Red Panda', 'Red Wolf', 'Red-handed Tamarin', 'Reindeer', 'Rhinoceros', 'River Dolphin', 'River Turtle', 'Rock Hyrax', 'Rockhopper Penguin', 'Roseate Spoonbill', 'Royal Penguin', 'Sabre-Toothed Tiger', 'Saint Bernard', 'Salamander', 'Sand Lizard', 'Saola', 'Sea Dragon', 'Sea Otter', 'Sea Slug', 'Sea Squirt', 'Sea Turtle', 'Seahorse', 'Seal', 'Serval', 'Sheep', 'Shrimp', 'Siberian Tiger', 'Silver Dollar', 'Sloth', 'Slow Worm', 'Snapping Turtle', 'Snowshoe', 'Snowy Owl', 'South China Tiger', 'Sparrow', 'Spectacled Bear', 'Sponge', 'Squid', 'Squirrel', 'Starfish', 'Stellers Sea Cow', 'Stick Insect', 'Stoat', 'Striped Rocket Frog', 'Sun Bear', 'Sun Beer', 'Swan', 'Tapir', 'Tarsier', 'Tasmanian Devil', 'Tawny Owl', 'Termite', 'Tetra', 'Thorny Devil', 'Tibetan Mastiff', 'Tiffany', 'Tiger', 'Tiger Salamander', 'Tortoise', 'Toucan', 'Tropicbird', 'Tuatara', 'Uakari', 'Uguisu', 'Umbrellabird', 'Vampire Bat', 'Vulture', 'Wallaby', 'Walrus', 'Warthog', 'Water Buffalo', 'Water Dragon', 'Water Vole', 'Weasel', 'Welsh Corgi', 'Whippet', 'White Rhinoceros', 'White Tiger', 'Wildebeest', 'Wolf', 'Wombat', 'Woodlouse', 'Woodpecker', 'Woolly Mammoth', 'Wrasse', 'X-Ray Tetra', 'Yak', 'Yellow-Eyed Penguin', 'Yorkshire Terrier', 'Zebra', 'Zebu', 'Zonkey', 'Zorse' ];


    const adjective = adj[Math.floor(Math.random()*adj.length)];
    const animal = bird[Math.floor(Math.random()*bird.length)];
    function capitalize(s) {
      return s[0].toUpperCase() + s.slice(1);
    }

   return `${capitalize(adjective)} ${animal}`
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

