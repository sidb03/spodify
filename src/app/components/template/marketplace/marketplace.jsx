import React, { Component, PureComponent } from 'react';
import { Row, Col, Card, Modal } from 'antd';

import aviciiCover from '../../../../images/covers/avicii.png';
import armada from '../../../../images/covers/armada.jpg';
import farEast from '../../../../images/covers/far-east.jpg';
import loadingGif from '../../../../images/loading.gif';

import { dataContainer } from '../../../containers/DataContainer';

import './marketplace.css';

const { Meta } = Card;
class SongCard extends PureComponent {
    buySong = cover => {
        console.log("cover", cover, this.props);
        this.props.open(cover);
    };
    render() {
        const { picAddress, songName, artistName, price, id } = this.props;
        return(
            <Col xs={24} md={12} xxl={6} onClick={() => this.buySong(id+1)}>
               <Card
                    hoverable
                    cover={<img alt="song-cover" src={picAddress} />}
                >
                    <p className="price">${price}</p>
                    <Meta
                    title={songName}
                    description={artistName}
                    />
                </Card>
            </Col>
        );
    }
}

function RenderSongCards(props) {
    const { songsList, open } = props;
    const totalCards = [];

    songsList.map((item, index) => {
        return totalCards.push( <SongCard picAddress={item.picAddress} songName={item.songName} artistName={item.artistName} price={item.price} open={open} id={index} key={index} /> );
    });
    console.log("total cards", totalCards);
return ( <div>{totalCards} </div>);
}

class Marketplace extends Component {
    state = {
        visible: false,
        activeSong: {},
        localLoad: false,
        modalMessage: ""
    };

    // async componentDidMount() {
    //     console.log("get all th market songs")
    //     let songsList = await dataContainer.getAllSongsFromMarket();
    //     console.log("got songs list", songsList);
    //     this.setState({ songsList, loading: false });
    // }

    handleOpen = id => {

        let c = id - 1;
        console.log("open modal");
        this.setState({ visible: true,
            activeSong: this.props.userData.songMarketplace[c],
            localLoad: true,
            modalMessage: "Fetching Price"
        }, async () => {
            let activeSong = this.state.activeSong;
            let etherPrice = await dataContainer.callInitiateBuy(id);
            console.log("ether price", etherPrice);
            activeSong.etherPrice = etherPrice;
            this.setState({
                activeSong,
                localLoad: false
            });
        });
    };
    handleCancel = () => {
        this.setState({ visible: false, localLoad: false });
    };
    handleOk = async () => {
        this.setState({
            localLoad: true,
            modalMessage: "Buying Song"
        });
        let activeSong = this.state.activeSong;
        await dataContainer.callBuy(activeSong.id);
        this.setState({
            visible: false,
            localLoad: false
        });
    };
    render() {
        const { activeSong } = this.state;
        const { userData } = this.props;
        const { songMarketplace, loading } = userData;
        const songsList = songMarketplace;
        console.log(songsList);
        console.log(userData);
        let template;

        if (loading) {
            console.log("loading");
            template = <div className="loading-container"> <img src={loadingGif} alt="loading..." className="loading-image" /></div>;
        } else {
            if(songsList.length > 0) {
                console.log(songsList.length);
                template = <RenderSongCards songsList={songsList} open={this.handleOpen} />
            } else {
                template = <div><h2>0 songs found, No songs available in the market.</h2></div>;
            }
        }

        var modalDiv = (this.state.localLoad)?
                <Modal title={this.state.modalMessage}
                    visible={this.state.visible}
                    wrapClassName = "app-error-modal"
                    onOk={this.handleOk}
                    okText=""
                    onCancel={this.handleCancel}
                >
                    <div>
                        <div><img src={loadingGif} alt="loading..." />
                        <p className="modal-message">Please confirm transaction!</p>
                    </div>
                    </div>
                </Modal>
                :
                <Modal title="Buy Song"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    okText="Buy"
                    onCancel={this.handleCancel}
                >
                    <div>
                        <img src={activeSong.picAddress} alt="song-cover" className="coverimg" />
                        <p className="song-name">{activeSong.name}</p>
                        <p className="artist-name">{activeSong.artist}</p>
                        <p className="price">
                            <span className="key">USD PRICE: </span> <span className="value">${activeSong.price}</span> <br />
                            <span className="key">ETH PRICE: </span> <span className="value">{activeSong.etherPrice}</span>
                        </p>
                    </div>
                </Modal>;
        return(
            <div className="template-content marketplace">
                {modalDiv}
                <h1 className="template-heading"><span>Marketplace</span></h1>
                <Row>
                    <Col span={24}>
                        {template}
                    </Col>
                </Row>
            </div>
        );
    };
}

export default Marketplace;