import React from 'react';
import axios from 'axios';
import Music from "./music.js"
import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';
import uuid from 'react-uuid';



export class SongDisplayByArtist extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            songData: []
        }
        
        this.parseAndStoreAPIData = this.parseAndStoreAPIData.bind(this);
    }

    parseAndStoreAPIData(songUrls){
        const tempSongData = []

        for(const songUrl of songUrls){
            var s3Location = songUrl.replace("s3 bucket link", ""); // place s3 bucket link here

            var index1 = s3Location.indexOf("/")
            var artistName = decodeURIComponent(s3Location.substring(0, index1)); // artist name
            var index2 = s3Location.lastIndexOf("/");
            var albumName = decodeURIComponent(s3Location.substring(index1 + 1, index2)); // album name
            var index3 = s3Location.indexOf("mp3");
            var songName = decodeURIComponent(s3Location.substring(index2 + 1, index3 -1)); // song name
            
            tempSongData.push({"id": uuid(), "artist": artistName, "album": albumName, "song": songName, "song_url": songUrl});
        }

        this.setState({ songData: tempSongData});

    }

    componentDidMount = (props) => {
        var self = this;

        if(this.props.artistName !== null){
            var encodedArtistString = encodeURI(this.props.artistName);

            axios.get(`/dev/songs/for/artist?artist=${encodedArtistString}`) // place /songs/for/artist?artist={} endpoint here
            .then(function(response1) {
                var songUrlList = [];
                var promises = [];
                for(const dataObject of response1.data){
                
                    var encodedSongString = encodeURI(dataObject);
                    promises.push(
                        axios.get(`/song?artist=${encodedArtistString}&song=${encodedSongString}`) // place /song?artist={}&song={} endpoint here
                        .then(function(response2) {
                            songUrlList.push(response2.data);
                        })
                    )
                }
                Promise.all(promises).then(() => { self.parseAndStoreAPIData(songUrlList)});
            })
            .catch(function(err) {
                console.log(err);
            })
        }
    }

    render() {

        const songList = this.state.songData.map((item) => 

        <Row key={item.id}>
            <Col sm={{ size: 2, offset: 0 }}>{item.song}</Col>
            <Col sm={{ size: 2, offset: 0 }}>{item.album}</Col>
            <Col sm={{ size: 2, offset: 0 }}>{item.artist}</Col>
            <Col sm={{ size: 2, offset: 0 }}><Music songName={item.song} albumName={item.album} artistName={item.artist} url={item.song_url}/></Col>
        </Row>
    )

    return (

        <div>
            <div>
                <button 
                    type="button" 
                    style={{marginLeft: "86%", width: "200px"}}
                    onClick={()=>{this.props.changeArtistViewState("artist_selection")}}>
                        Go Back To Artist Selection
                    </button>
            </div>
            <h3>{this.props.artistName}</h3>
        <Container>
            <Row className="show-grid" style={{textDecoration: "underline"}}>
                <Col sm={{ size: 2, offset: 0 }}>Song</Col>
                <Col sm={{ size: 2, offset: 0 }}>Album</Col>
                <Col sm={{ size: 2, offset: 0 }}>Artist</Col>
                <Col sm={{ size: 2, offset: 0 }}>Play/Pause</Col>
            </Row>
            {songList}

        </Container>
        </div>
    )

    }
}

export default SongDisplayByArtist;
