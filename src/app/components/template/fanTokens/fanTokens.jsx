import React, { Component, PureComponent } from "react";
import { Row, Col, Card, Modal } from "antd";
import aviciiCover from "../../../../images/covers/avicii.png";
import armada from "../../../../images/covers/armada.jpg";
import farEast from "../../../../images/covers/far-east.jpg";
import loadingGif from '../../../../images/loading.gif';
import "./fanTokens.css";
import { dataContainer } from "../../../containers/DataContainer";

class TokenComp extends PureComponent {
  render() {
    const { token, showModal } = this.props;
    console.log("fan token owned by user", token);
    const { artistName, balance, tokenName, address } = token;
    return (
      <Row className="token-item">
        <Col xs={9} sm={12} lg={10}>
          <p className="artist">{artistName}</p>
          <p className="tokens">{address}</p>
        </Col>
        <Col xs={7} sm={5} lg={7} xl={7}>
            <p style={{textAlign: 'right'}}>
                <span className="tokens">{balance}</span>
                <span className="token-name">{tokenName}</span>
            </p>
        </Col>
        <Col xs={7} xl={6} style={{textAlign: 'right'}}>
            <button className="btn send-token" onClick={() => showModal(tokenName)}>send tokens</button>
        </Col>
      </Row>
    );
  }
}

class FanTokens extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      showLoading: false,
      activeToken: {},
      tokensToSend: 0,
      toAddress :null
    }

    this.updateToken = this.updateToken.bind(this);
  }
  renderTokens = tokenList => {
    console.log("tokens list", tokenList);
    const list = [];
    tokenList.map((item, index) => {
      return list.push(<TokenComp token={item} key={index} showModal={this.showModal} />);
    });
    return <div> {list} </div>;
  };
  showModal = (tokenName) => {
    const tokensList = this.props.userData.ownedTokens;
    let t = tokensList.findIndex(t => t.tokenName === tokenName);
    if(t >= 0) {
      this.setState({ 
        visible: true,
        activeToken: tokensList[t] 
      });
    }
  };
  handleCancel = () => {
    this.setState({ visible: false, tokensToSend: 0, toAddress: null });
  };
  handleOk = async() => {
    this.setState({
      showLoading: true
    })
    console.log(this.state.toAddress, this.state.tokensToSend, this.state.activeToken.instance);
    await dataContainer.transferUserTokens(this.state.toAddress, this.state.tokensToSend, this.state.activeToken.instance)
    await dataContainer.afterSongPurchased();
    this.setState({
      visible: false,
      tokensToSend: 0,
      toAddress: null,
      showLoading: false
    })
  };
  updateToken = event => {
    const tokensToSend = event.target.value;
    if(tokensToSend <= this.state.activeToken.balance) {
      console.log("tokens:", tokensToSend);
      this.setState({ tokensToSend });
    }
  }
  updateAddress = event => {
    const toAddress = event.target.value;
    if (dataContainer.state.web3.isAddress(toAddress)) {
      this.setState({
        toAddress
      });
    }
  }
  render() {
    const { userData } = this.props;
    const { ownedTokens } = userData;
    const tokensList = ownedTokens;
    const { activeToken } = this.state;
    let template;

    if(tokensList.length > 0) {
      template = <Card> { this.renderTokens(tokensList) } </Card>
    } else {
      template = <div><h2>0 tokens found, Buy some songs from the market.</h2></div>;
    }
    var modalDiv = (this.state.showLoading)? 
        <Modal title="Transferring tokens"
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
      <Modal title="Transfer Tokens"
        visible={this.state.visible}
        onOk={this.handleOk}
        okText="Buy"
        footer={null}
        onCancel={this.handleCancel}
          >
        <div className="token-form">
            <div className="block">
              <p className="key">CURRENT BALANCE: </p> 
              <p className="value"><span className="total">{activeToken.balance} </span><span className="name">{activeToken.tokenName}</span></p>
            </div>
            <div className="block">
              <p className="key"># TOKENS TO SEND: </p> 
              <p className="value"><input type="text" className="token-input" onChange={this.updateToken} /></p>
            </div>
            <div className="block">
              <p className="key">ETH ADDRESS OF RECIPIENT: </p> 
              <p className="value"><input type="text" className="token-input" onChange={this.updateAddress} /></p>
            </div>
            <div className="block" style={{textAlign: 'right', paddingRight:'5%'}}>
              <button className="btn btn-sendtoken" onClick={this.handleOk}>Send {this.state.tokensToSend} {activeToken.tokenName}</button>
            </div>
        </div>
        </Modal>
    return (
      <div className="template-content fan-tokens">
      {modalDiv}

        <h1 className="template-heading">
          <span>My Fan Tokens</span>
        </h1>
        {template}
      </div>
    );
  }
}

export default FanTokens;
