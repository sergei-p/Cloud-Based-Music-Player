import React from 'react';
import axios from 'axios';
import uuid from 'react-uuid';
import { Button } from 'react-bootstrap';
import Artists from './artists.js';
import Genres from './genres.js';

export class LoggedIn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            songData: [],
            albumData: [],
            artistData: [],
            currentView: "main_menu"
        };

        this.firstAPIRequest = true;

        this.songObjects = []
        this.parseAndStoreAPIData = this.parseAndStoreAPIData.bind(this);
        this.changeView = this.changeView.bind(this);
    }

    parseAndStoreAPIData(songs){
        const tempSongs = [];
        const tempAlbums = [];
        const tempArtists = [];

        for(const song of songs){
            if(song.song_name.search("/") === -1){

                tempSongs.push({"id": uuid(),"artist": "unkown", "album": "uknown", "song": song.song_name, "song_url": song.song_url});
            
            } else if((song.song_name.match(/\//g) || []).length === 1){ // album
                
                var alIndex = song.song_name.indexOf("/");
                var alVal = song.song_name.substring(0, alIndex); // album name
                var alSgVal = song.song_name.substring(alIndex + 1); // song name
                
                tempAlbums.push({"id": uuid(), "artist": "unkown", "album": alVal, "song": alSgVal, "song_url": song.song_url});
                
            } else if((song.song_name.match(/\//g) || []).length === 2){ // artist
               
                var arIndex1 = song.song_name.indexOf("/")
                var arVal = song.song_name.substring(0, arIndex1); // artist name
                var arIndex2 = song.song_name.lastIndexOf("/");
                var alArVal = song.song_name.substring(arIndex1 + 1, arIndex2); // album name
                var alArSgVal = song.song_name.substring(arIndex2 + 1); // song name

                tempArtists.push({"id": uuid(),"artist": arVal, "album": alArVal, "song": alArSgVal, "song_url": song.song_url});
        
            } else{
                console.log("An error occured while parsing API data");
            }
        }

        this.setState({
            songData: tempSongs,
            albumData: tempAlbums,
            artistData: tempArtists
        })

    }

    componentDidMount = (props) => {
        var self = this;
        if(this.firstAPIRequest === true){
            axios.get('') // place intial API endpoint here
                .then(function (response) {
                
                self.parseAndStoreAPIData(response.data);

                })
                .catch(function (error) {
                  console.log(error);
                })

            self.firstAPIRequest = false;
        }
    }

    changeView(viewOption){
        this.setState({
            currentView: viewOption
        })

    }

    render() {

        const menuOptions = (
            <div>
                <h3>Main Menu</h3>
                <dl>
                    <dt>
                       <button 
                            type="button" 
                            style={{width: "400px", height: "40px"}}
                            onClick={()=>this.changeView("view_artists")}>
                                Artists
                        </button>
                    </dt>
                    <dt>
                        <button 
                            type="button" 
                            style={{width: "400px", height: "40px"}}
                            onClick={()=>this.changeView("view_genres")}>
                                Genres
                        </button>
                    </dt>
                </dl>
            </div>
        )       

        if(this.state.currentView === "main_menu"){
            return(menuOptions)
        } else if(this.state.currentView === "view_genres") {
            return(<Genres changeViewState={this.changeView}/>);
        } else if(this.state.currentView === "view_artists") {
            return(<Artists changeViewState={this.changeView}/>)
        }

    }
}

export default LoggedIn;