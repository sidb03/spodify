import React, { Component } from "react";
import { Modal } from 'antd';

import MySongs from "./mySongs/mySongs";
import Marketplace from "./marketplace/marketplace";
import ArtistPolls from "./artistPolls/artistPolls";
import About from "./about/about";
import FanTokens from "./fanTokens/fanTokens";

import TokenInfo from "../userDetails/tokenInfo/tokenInfo";
import loadingGif from '../../../images/loading.gif';

import "./activeTemplate.css";

const RenderTemplate = (templateName, userData) => {
  switch (templateName) {
    case "mySongs":
      return <MySongs userData={userData} />;
    case "marketplace":
      return <Marketplace userData={userData} />;
    case "artistPolls":
      return <ArtistPolls userData={userData} />;
    case "fanTokens":
      return <FanTokens userData={userData} />;
    case "about":
      return <About />;
    default:
      return <MySongs userData={userData} />;
  }
};

class ActiveTemplate extends Component {

  render() {
    const { template, data } = this.props;
    const { activeTemplate } = template.state;
    const userData = data.state;

    return (
      <div className="template">
        <div className="token-info">
          <TokenInfo />
        </div>
      
        <Modal title={userData.modalMessage}
            visible={userData.showModal}
            wrapClassName="app-error-modal"
            onOk={this.handleOk}
            okText="Buy"
            onCancel={this.handleCancel}
        >
        <div><img src={loadingGif} alt="loading..." /></div>
        </Modal>
        { RenderTemplate(activeTemplate, userData) }
      </div>
    );
  }
}

export default ActiveTemplate;
