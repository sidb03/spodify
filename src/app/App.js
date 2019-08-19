import React, { Component } from 'react';
import getWeb3 from '../utils/getWeb3';
import musicApp from '../../build/contracts/musicApp.json';
import factory from '../../build/contracts/FanTokenFactory.json';
//import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
//import getWeb3 from './utils/getWeb3'

import { Subscribe } from 'unstated';
import Sidebar from './components/sidebar/sidebar';
import ActiveTemplate from './components/template/activeTemplate';
import TemplateContainer from './containers/TemplateContainer';
import DataContainer from './containers/DataContainer';
import { dataContainer } from './containers/DataContainer';

import loadingGif from '../images/loading.gif'

import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      loading: true
    }
  }

  web3;
  myAccountAddress;
  contractInstance;


  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.web3 = results.web3;
      // this.setState({web3: results.web3});
      // dataContainer.setWeb3(results.web3);

      // Instantiate contract once web3 provided.
      if(this.web3 !== undefined && this.web3 !== null) {
        this.instantiateContracts();
      } else {
        dataContainer.throwAppError();
      }
    })
    .catch(() => {
      console.log('Error finding web3.');        
      dataContainer.throwAppError();
    })

  }

  instantiateContracts = async () => {
    const contract = require('truffle-contract')
    const appContract = contract(musicApp)
    const factoryContract = contract(factory)
    appContract.setProvider(this.web3.currentProvider)
    factoryContract.setProvider(this.web3.currentProvider)

    //let accounts = await this.state.web3.eth.accounts

    // fetch accounts available, initialize this user's address on React state
    this.web3.eth.getAccounts(async (error, accounts) => {
        console.log('My Address: ' + accounts[0]);

        if(accounts[0] !== undefined && accounts[0] !== null) {
          console.log("executing func");
          this.myAccountAddress = accounts[0];

          let deployedContract = await appContract.deployed();
          if(deployedContract !== undefined && deployedContract !== null) {
            this.contractInstance = deployedContract;
            dataContainer.setContractInstance(this.web3, this.myAccountAddress, this.contractInstance);
          } else {
            dataContainer.throwAppError();
          }
      
        } else {
          console.log("throw error fro null address");
          dataContainer.throwAppError();
        }
        // this.setState({ loading: false });
      });

    // Obtain a reference to the deployed contract.
    // using one of the two:
    // .deployed() for local contracts (on Ganache, truffle develop)
    // .at() to fetch contract at an address if deployed outside of truffle e.g. via Remix

    
    dataContainer.setFactoryInstance(await factoryContract.deployed());

    /*
    let deployedContract = await gameContract.at(
      '0x3ca1f7495303761ac1da9f69e48f5fbbe0532606'
    )
    */

    // Store reference to this deployed contract in React state, for global consumption
    // and when that's done, initiate a sync between contract state and local state
    // this.setState({ contractInstance: deployedContract }, async () => {
    //   await this.syncContractStateWithLocal()
    // })

  }

  render() {
    return (
      <div className="App">
        {/* <div className="loading-container">
          <img src={loadingGif} className="loading-image" />
        </div> */}
        <div className="sidebar-menu">
          <Sidebar />
        </div>
        <div className="active-template">
          <Subscribe to={[TemplateContainer, DataContainer]}>
            {(template, data) => (
              <ActiveTemplate template={template} data={data} />
            )}
          </Subscribe>
        </div>
      </div>
    );
  }
}

export default App;
