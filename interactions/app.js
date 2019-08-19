import getWeb3 from '../utils/getWeb3'
import musicApp from '../../build/contracts/musicApp.json'

state = {
    web3: null,
    contractInstance: null,
    contractStateFetched: false,
    myAccountAddress: -1,
    initialBlockNumber: -1,

    contractState: {
      gameIteration: -1,
      phaseOfGameplay: '',
      voteOpen: true,
      teamNames: [],
      teamNamesAscii: [],
      voteCounts: [],
      voteBackings: [],
      teamStats: [],
      totalVotes: -1,
      totalBacking: -1,
      contractBalance: -1,
      lastWinner: null,
      refereeAddress: null
    },

    flagVoted: false,
    flagSelected: null,
    dashboardOpen: false,
    pastTxns: []
  }

componentWillMount() {
// Get network provider and web3 instance.
// See utils/getWeb3 for more info.
getWeb3
    .then(results => {
    this.setState({
        web3: results.web3
    })

    // Instantiate contract once web3 provided.
    this.instantiateContract()
    })
    .catch(() => {
    console.log('Error finding web3.')
    })
}

instantiateContract = async () => {
    const contract = require('truffle-contract')
    const appContract = contract(musicApp)
    musicApp.setProvider(this.state.web3.currentProvider)

    //let accounts = await this.state.web3.eth.accounts

    // fetch accounts available, initialize this user's address on React state
    this.state.web3.eth.getAccounts((error, accounts) => {
      console.log('My Address: ' + accounts[0])
      this.setState({ myAccountAddress: accounts[0] })
    })

    // Obtain a reference to the deployed contract.
    // using one of the two:
    // .deployed() for local contracts (on Ganache, truffle develop)
    // .at() to fetch contract at an address if deployed outside of truffle e.g. via Remix
    let deployedContract = await musicApp.deployed()

    /*
    let deployedContract = await gameContract.at(
      '0x3ca1f7495303761ac1da9f69e48f5fbbe0532606'
    )
    */

    // Store reference to this deployed contract in React state, for global consumption
    // and when that's done, initiate a sync between contract state and local state
    this.setState({ contractInstance: deployedContract }, async () => {
      await this.syncContractStateWithLocal()
    })

    this.state.web3.eth.getBlockNumber((err, currentBlockNum) => {
      console.log('Current block number: ' + currentBlockNum)
      this.setState({ initialBlockNumber: currentBlockNum })
  }
}