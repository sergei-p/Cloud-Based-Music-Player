import React from 'react';
import axios from 'axios';
import SongDisplayByGenre from './songDisplayByGenre';

export class Genres extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            genres: [],
            currentView: "genre_selection",
            selectedGenre: ""
        }

        this.setData = this.setData.bind(this);
        this.changeGenreView = this.changeGenreView.bind(this);
    }


    setData(data){
        this.setState({
            genres: data
        })
    }

    componentDidMount = (props) => {
        var self = this;
        axios.get('') // place /genres endpoint here
            .then(function(response) {
                self.setData(response.data)
            })
            .catch(function(err) {
                console.log(err);
            })
    }

    changeGenreView(view) {
        this.setState({
            currentView: view,
        })
    }
    
    render() {

        const listGenres = this.state.genres.map((genre) =>
            <dt>
                <button 
                    type="button"
                    style={{width: "400px", height: "40px"}}
                    onClick={()=> {
                                this.setState({
                                    currentView: "song_list",
                                    selectedGenre: genre
                                })
                            }}>
                       {genre}
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
        
        if(this.state.currentView === "genre_selection") {
            return (
                <div>
                    {mainMenuButton}
                    <h3>Genres</h3>
                    <dl>
                        {listGenres}
                    </dl>
                </div>
            )
        } else if(this.state.currentView === "song_list") {
            return(<SongDisplayByGenre genreName={this.state.selectedGenre} changeGenreViewState={this.changeGenreView}/>);
        }
    }
}

export default Genres;