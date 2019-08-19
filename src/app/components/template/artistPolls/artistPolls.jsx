import React, { Component, PureComponent } from 'react';
import { Row, Col, Radio, Affix, Modal } from 'antd';

import './artistPolls.css';
import clock from '../../../../images/clock.svg';
import farEast from '../../../../images/covers/far-east.jpg';
import { dataContainer } from '../../../containers/DataContainer';
import loadingGif from '../../../../images/loading.gif';
const RadioGroup = Radio.Group;

class Options extends Component {
    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        const { value, keys } = this.props;  
        return (
            <Radio style={radioStyle} value={keys}>{value}</Radio>
        );
    }
}

class Poll extends PureComponent {
    
    state = {
        selectedOption: 0,
        tokensVoted: 0,
        showLoading: false
    }
    renderOptions = (options) => {
        console.log("poll options", options);
        const optionsList = [];
        options.map((item, index) => {
            return optionsList.push(<Options value={item} keys={index} />)
        });
        console.log("options list",[optionsList]);
        return ( [optionsList] );
    }
    selectOption = event => {
        const selectedOption = event.target.value;
        this.setState({selectedOption});
    }
    handleTokens = event => {
        const tokensVoted = event.target.value;
        this.setState({tokensVoted});
    }
    handleOk = async () => {
        this.setState({
            showLoading: true
        })
        // console.log(this.state.toAddress, this.state.tokensToSend, this.state.activeToken.instance);
        // await dataContainer.transferUserTokens(this.state.toAddress, this.state.tokensToSend, this.state.activeToken.instance)
        // await dataContainer.afterSongPurchased();
        // this.setState({
        //     visible: false,
        //     tokensToSend: 0,
        //     toAddress: null,
        //     showLoading: false
        // }
        const { pollInfo } = this.props;
        await dataContainer.castVoteForUser(pollInfo.tokenInstance, pollInfo.id, this.state.selectedOption, this.state.tokensVoted);
        console.log("values:", this.state.selectedOption, this.state.tokensVoted, pollInfo.tokenInstance, pollInfo.id);
         this.setState({
            showLoading: false
        })
    };
    render() {
        const { pollInfo } = this.props;
        const { artistName, question, expiryVotes, votesPolled, options, balance } = pollInfo;
        var modalDiv = (this.state.showLoading)? 
              <div><img src={loadingGif} alt="loading..." />
              </div>
      : <div><div className="polls-box-head">
                        <p style={{paddingBottom:'20px'}}>
                            <span className="artist">{artistName}</span>
                        </p>
                        <p>
                            <span className="question">
                                {question}
                            </span>
                        </p>
                        <p>
                            <span className="tokensleft">
                                <img src={clock} alt="clock-icon" /> {expiryVotes} tokens until poll closes. {votesPolled} tokens received so far
                            </span>
                        </p>
                    </div>
                    <div className="polls-box-body">
                        <div className="poll-options">
                        <RadioGroup onChange={this.selectOption}>
                            { this.renderOptions(options) }
                        </RadioGroup>
                        </div>
                        <div>
                            <p className="left-token">You have <span>{balance} fan tokens</span> for this artist</p>
                        </div>
                        <div className="poll-input">
                            <input type="text" className="token-input" onChange={this.handleTokens} placeholder="Enter # of tokens to vote with" />
                            <button className="btn btn-submitpoll" onClick={this.handleOk} >Submit vote</button>
                        </div>
                    </div></div>
        return (
            <Col xs={24} lg={12} xxl={8}>
                <div className="polls-box">
                   {modalDiv} 
                </div>
            </Col>
        );       
    }
}

function RenderPolls(props) {
    let { pollsList } = props;
    let pollsToRender = [];

    pollsList.map((item, index) => {
        return pollsToRender.push(<Poll pollInfo={item} key={index} />);
    });
    return ( <div>{pollsToRender}</div> );
}

class ArtistPolls extends Component {

    activePolls = [];
    inactivePolls = [];
    state = {
        mode: 'recent'
    }

    sortPolls = e => {
        console.log("sort polls", e);
        let mode = e.target.value;
        this.setState({ mode });
    };

    render() {
        const { mode } = this.state;
        const { userData } = this.props;
        const { livePolls, pastPolls } = userData;
        console.log(livePolls, pastPolls);
        let activePolls;
        let template;

        if(this.state.mode === 'recent') {
            console.log("new");
            if(livePolls.length > 0) {
                activePolls = livePolls;
                template = <Row> <RenderPolls pollsList={activePolls} /> </Row>
            } else {
                template = <div><h2>0 polls found, Buy some songs from the market.</h2></div>;
            }
        } if(this.state.mode === 'old') {
            console.log("past");
            if(pastPolls.length > 0) {
                activePolls = pastPolls;
                template = <Row> <RenderPolls pollsList={activePolls} /> </Row>
            } else {
                template = <div><h2>0 polls found, Buy some songs from the market.</h2></div>;
            }
        }
        return(
            <div className="template-content artist-polls">
                <div className="head">
                    <h1 className="template-heading"><span>Artist Polls</span></h1>

                    <Affix offsetTop={20}>
                        <Radio.Group onChange={this.sortPolls} value={mode} style={{ marginBottom: 8 }}>
                            <Radio.Button value="recent">open now</Radio.Button>
                            <Radio.Button value="old">previous</Radio.Button>
                        </Radio.Group>
                    </Affix>
                    <div className="clear"></div>
                </div>
                <div className="polls-container">
                    <h3><span>3</span> POLLS OPEN NOW</h3>
                    {template}
                </div>
            </div>
        );
    };
}

export default ArtistPolls;