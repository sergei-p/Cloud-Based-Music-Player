import React from 'react';
import SongDisplayByArtist from './songDisplayByArtist.js';
import axios from 'axios';


export class Artists extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            artists: [],
            currentView: "artist_selection",
            selectedAritst: ""
        }

        this.setData = this.setData.bind(this);
        this.changeArtistView = this.changeArtistView.bind(this);
    }

    setData(data){
        this.setState({
            artists: data
        })
    }

    componentDidMount = (props) => {
        var self = this;
        axios.get('') // place /artists endpoint here
            .then(function(response) {
               
                self.setData(response.data)
            })
            .catch(function(err) {
                console.log(err);
            })
    }

    changeArtistView(view) {
        this.setState({
            currentView: view,
        })
    }

    render() {
        
        const listArtists = this.state.artists.map((artist) =>
        <dt>
            <button 
                type="button"
                style={{width: "400px", height: "40px"}}
                onClick={()=> {
                            this.setState({
                                currentView: "song_list",
                                selectedAritst: artist
                            })
                        }}>
                   {artist}
            </button>
        </dt>
    )

    const mainMenuButton = (
        <div>
        <button 
            type="button" 
            style={{marginLeft: "86%", width: "200px"}}
            onClick={()=>{this.props.changeViewState("main_menu")}}>
                Go Back To Main Menu
            </button>
    </div>
    )
    
    if(this.state.currentView === "artist_selection") {
        return (
            <div>
                {mainMenuButton}
                <h3>Artists</h3>
                <dl>
                    {listArtists}
                </dl>
            </div>
        )
    } else if(this.state.currentView === "song_list") {
        return(<SongDisplayByArtist artistName={this.state.selectedAritst} changeArtistViewState={this.changeArtistView}/>);
    }
    }
}

export default Artists;