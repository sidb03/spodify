import React, { Component, PureComponent } from 'react';
import { Row, Col, Card } from 'antd';
import ReactAudioPlayer from 'react-audio-player';

import loadingGif from '../../../../images/loading.gif';

import { dataContainer } from '../../../containers/DataContainer';

import './mySongs.css';
const { Meta } = Card;

class MusicPlayer extends PureComponent {
    render() {
        const { song } = this.props;
        console.log(song);
        const changeVolume = () => {
            console.log("element", this.rap);
        };
        return (
            <Col span={24} className="music-player">
                <div className="song-cover">
                    <img src={song.picAddress} />
                </div>
                <div className="audio-player">
                <ReactAudioPlayer
                    ref={(element) => { this.rap = element; }}
                    onVolumeChanged = {changeVolume}
                    src={song.songHash}
                    autoPlay
                    controls
                    controlsList="nodownload"
                />
                </div>
            </Col>
        );
    }
}

class SongCard extends PureComponent {
    render() {
        const { picAddress, songName, artist, playSong } = this.props;        
        return(
            <Col xs={24} sm={12} xxl={6}>
               <Card
                    hoverable
                    cover={<img alt="example" src={picAddress}
                    onClick={() => playSong(picAddress)} />}
                >
                    <Meta
                    title={songName}
                    description={artist}
                    />
                </Card>
            </Col>
        );
    }
}

function RenderSongCards(props) {
    const { songsList, playSong } = props;
    console.log("songslist", songsList);
    const totalCards = [];

    songsList.map((item, index) => {
        return totalCards.push( <SongCard picAddress={item.picAddress} songName={item.songName} artist={item.artist} playSong={playSong} key={index} /> );
    });
    console.log("total cards", totalCards);
    return ( <div> {totalCards} </div>);
}

class MySongs extends Component {
   
    async componentDidMount() {
        dataContainer.getSongsList();
    };

    state = {
        songPlaying: null
    };
    toggleMusicPlayer = cover => {
        const { userData } = this.props;
        const { songsList, loading } = userData;
        console.log("cover ye hai:" ,cover);
        console.log("songsList-", songsList);
        let s = songsList.findIndex(song => song.picAddress === cover);
        console.log("s;", s);
        if(s >= 0) {
            this.setState({ songPlaying: songsList[s] });
        } else {
            this.setState({ songPlaying: null });
        }
    };
    render() {
        const { songPlaying } = this.state;
        const { userData } = this.props;
        const { songsList, loading } = userData;

        let heading;
        let template;
        if(loading) {
            template = <div className="loading-container"> <img src={loadingGif} alt="loading..." className="loading-image" /></div>;
        } else {
            if(songPlaying === null) {
                if(songsList.length > 0) {
                    template = <RenderSongCards songsList={songsList} playSong={this.toggleMusicPlayer} />;
                } else {
                    template = <div><h2>0 songs found, get some latest hits from market.</h2></div>;
                }
                heading = <h1 className="template-heading"><span>My Songs</span></h1>
            } else {
                template = <MusicPlayer song={songPlaying} />;
                heading = <p className="sec-heading" onClick={() => this.toggleMusicPlayer(null)}>{`< back to all songs`}</p>
            }
        }

        return(
            <div className="template-content">
                {heading}
                <Row>
                    <Col span={24} className="main-row">
                        {template}
                    </Col>
                </Row>
            </div>
        );
    };
}

export default MySongs;