import React, { Component } from 'react';

import './tokenInfo.css';
import { dataContainer } from '../../../containers/DataContainer';

class TokenInfo extends Component {
    render() {
        return (
            <div className="tokenInfo">
                <p>
                    <span className="key">my address: </span> 
                    <span className="value">{dataContainer.state.myAccountAddress}</span>
                </p>
                <p>
                    <span className="key">balance: </span> 
                    <span className="value">{dataContainer.state.ethBalance} ETH</span>
                </p>
            </div>
        );
    }
}

export default TokenInfo;