import axios from 'axios';
import React from 'react';
// NOTE: inspiration for music player was taken from 
// https://stackoverflow.com/questions/47686345/playing-sound-in-react-js

class Music extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            play: false
        }
        
        this.sendSQSmessage = this.sendSQSmessage.bind(this);
        this.audio = new Audio(this.props.url)
    }
  
    componentDidMount() {
      this.audio.addEventListener('ended', () => this.setState({ play: false }));
    }
  
    componentWillUnmount() {
      this.audio.removeEventListener('ended', () => this.setState({ play: false }));  
    }
    
    sendSQSmessage(){
      axios.post('', { // place /play endpoint here
        artist: this.props.songName,
        album: this.props.albumName,
        song: this.props.artistName
      }).then((response) => {
        console.log(response);
      }).catch((err) => {
        console.log(err);
      })
    }


    togglePlay = () => {
      if(!this.state.play) {
        this.sendSQSmessage();
      }
      this.setState({ play: !this.state.play }, () => {
        this.state.play ? this.audio.play() : this.audio.pause();
      });
    }
  
    render() {
      return (
        <div>
          <button onClick={this.togglePlay}>{this.state.play ? 'Pause' : 'Play'}</button>
        </div>
      );
    }
  }
  
  export default Music;