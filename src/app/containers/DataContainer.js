import { Container } from "unstated";

import aviciiCover from "../../images/covers/avicii.png";
import armada from "../../images/covers/armada.jpg";
import farEast from "../../images/covers/far-east.jpg";
import fanToken from "../../../build/contracts/FanToken.json";
import Item from "antd/lib/list/Item";
export default class DataContainer extends Container {
  state = {
    web3: null,
    contractInstance: null,
    myAccountAddress: null,
    ethBalance: null,
    showModal: true,
    modalMessage: 'Initializing app...',
    loading: false,
    songsList: [],
    songMarketplace: [],
    factoryInstance: null,
    ownedTokenContracts: [],
    livePolls: [],
    pastPolls: [],
    ownedTokens: []
  };

  songMarketplace = [];
  songsList = [];
  livePolls = [];
  pastPolls = [];
  ownedTokens = [];
  ownedTokenContracts = [];

  throwAppError() {
    console.log("set state error");
    this.setState({ showModal: true });
  }

  setContainerState = (...stateVars) => {
      stateVars.map((item, index) => {
        console.log("items to set state from", item);
      });
  };

  setContractInstance = (web3, myAccountAddress, contractInstance) => {
    if (contractInstance !== undefined) {
      this.setState(
        { web3, myAccountAddress, contractInstance, modalMessage: 'Collecting data...' },
        async () => {
          var registered = await this.state.contractInstance.checkIfNewUser(
            this.state.myAccountAddress
          );
          console.log("New User:", registered);
          if (registered) {
            console.log("attempt User Registration");
            this.setState({modalMessage: "Registering User.."});
            await this.registerUser();
          }
          await this.setUserEthBalance();
          await this.getAllSongsFromMarket();
        //   await this.callInitiateBuy(1);
        //   await this.callBuy(1);
        //   await this.callInitiateBuy(2);
        //   await this.callBuy(2);
          await this.getSongsList();
          await this.getUserTokens();
          // console.log("owned token contrats", this.ownedTokenContracts);
          await this.getAllLivePolls();
          // console.log("live polls", this.livePolls);
          // await this.castVoteForUser(this.state.livePolls[0].tokenInstance, this.state.livePolls[0].id, 1, 1);
          await this.getAllPastPolls();
          // console.log("past polls", this.pastPolls);
          //await this.transferUserTokens(0xf17f52151EbEF6C7334FAD080c5704D77216b732, 1, this.state.ownedTokenContracts[0]);
          await this.getTokenList();
          // console.log("owned tokens", this.ownedTokens);
          this.setState({ 
                songMarketplace: this.songMarketplace,
                songsList: this.songsList, 
                livePolls:this.livePolls, 
                pastPolls: this.pastPolls, 
                ownedTokens: this.ownedTokens, 
                ownedTokenContracts: this.ownedTokenContracts,
                showModal: false
            });
        }
      );
    } else {
      console.log("empty contract");
      this.setState({ showModal: true });
    }
  };

  afterSongPurchased = async () => {
        await this.getSongsList();
        await this.getAllSongsFromMarket();
        await this.getUserTokens();
        await this.getAllLivePolls();
        await this.getAllPastPolls();
        await this.getTokenList();

        this.setState({
            songMarketplace: this.songMarketplace,
            songsList: this.songsList,
            livePolls:this.livePolls, 
            pastPolls: this.pastPolls, 
            ownedTokens: this.ownedTokens, 
            ownedTokenContracts: this.ownedTokenContracts,
            showModal: false
        });
  };

  setFactoryInstance = factoryInstance => {
    if (factoryInstance !== undefined) {
      this.setState({ factoryInstance });
    } else {
      this.setState({ showModal: true, modalMessage: 'Error occured!' });
    }
  };
  async setUserEthBalance() {
    var ethBalance;
    this.state.web3.eth.getBalance(this.state.myAccountAddress, (err, balance) => {
      ethBalance = this.state.web3.fromWei(balance, "ether");
      console.log("Eth balance:", ethBalance);
      this.setState({
        ethBalance: ethBalance.toNumber()
      });
    });
  }
  async registerUser() {
    try {
      await this.state.contractInstance.registerUser({
        from: this.state.myAccountAddress
      });
      console.log("User Registered");
    } catch (error) {
      console.log("User Reg failed");
    }
  }

  async callInitiateBuy(songId) {
    console.log("Initiating song buy!");
    var appInstance = this.state.contractInstance;
    await appInstance.initiateBuy(songId, {
      from: this.state.myAccountAddress
    });
    let weiPrice = await appInstance.getLatestWeiPrice(songId);
    console.log(this.state.web3.fromWei(weiPrice.toNumber(), "ether"));
    return this.state.web3.fromWei(weiPrice.toNumber(), "ether");
  }

  async callBuy(songId) {
    var appInstance = this.state.contractInstance;
    let weiPrice = await appInstance.getLatestWeiPrice(songId);
    console.log("Attempting Buy");
    let result = await appInstance.buySong(songId, {
      from: this.state.myAccountAddress,
      value: 1000000000000000000
    });

    console.log("song bought", result.tx);
    await this.afterSongPurchased();
  }

  async getSongDetails(songID) {
    var obj = new Object();
    var userAddress = this.state.myAccountAddress;
    var appInstance = this.state.contractInstance;
    let songDetails = await appInstance.getSongDetails(songID, {
      from: userAddress
    });
    obj.songHash = await this.getIPFSurl(songDetails[0]);
    obj.songName = songDetails[1];
    obj.picAddress = await this.getIPFSurl(songDetails[2]);
    obj.artist = songDetails[3];
    return obj;
  }

  async getSongsList() {
    var appInstance = this.state.contractInstance;
    var userAddress = this.state.myAccountAddress;
    var songList;
    var library = new Array();
    try {
      songList = await appInstance.getUserSongList({
        from: userAddress
      });
      let i = 0;
      console.log("Number of songs:", songList.length);
      while (songList[i] != null) {
        library.push(await this.getSongDetails(songList[i]));
        i++;
      }
    } catch (error) {
      console.error("Get songs list failed");
    }
    this.songsList = library;
    // this.setState({songsList: library});
    console.log(library);
  }
  async getTokenList() {
    var tokens = new Array();
    for (let i = 0; i < this.ownedTokenContracts.length; i++) {
      tokens.push(await this.getTokenDetails(this.ownedTokenContracts[i]));
    }
    this.ownedTokens = tokens;
    console.log("owned tokens", this.ownedTokens);
    // this.setState({ownedTokens: tokens});
  }
  async getTokenDetails(tokenInstance) {
    var token = new Object();
    var tokenDetails = await tokenInstance.getAllTokenDetails({
      from: this.state.myAccountAddress
    });
    var artistDetails = await this.state.contractInstance.getArtistDetailsByAddress(
      tokenDetails[2]
    );
    token.instance = tokenInstance;
    token.address = tokenInstance.address;
    token.artistName = artistDetails[0];
    token.balance = (await tokenInstance.balanceOf(
      this.state.myAccountAddress
    )).toNumber();
    token.symbol = tokenDetails[1];
    token.tokenName = tokenDetails[0];
    return token;
  }
  async getStoreSongDetails(songID, userAddress) {
    var obj = new Object();
    var appInstance = this.state.contractInstance;
    let songDetails = await appInstance.getSongStoreDetails(songID, {
      from: userAddress
    });
    obj.songName = songDetails[0];
    obj.picAddress = await this.getIPFSurl(songDetails[1]);
    obj.artistName = songDetails[2];
    obj.price = songDetails[3].toNumber();
    obj.id = songID.toNumber();
    return obj;
  }

  async getAllSongsFromMarket() {
    var appInstance = this.state.contractInstance;
    var userAddress = this.state.myAccountAddress;
    var songList;
    try {
      songList = await appInstance.getStoreSongList({
        from: userAddress
      });
      console.log("data song list:");
      for (let i = 0; i < songList.length; i++) {
        console.log(songList[i].toNumber());
      }
      var store = new Array();
      for (let j = 0; j < songList.length; j++) {
        store.push(await this.getStoreSongDetails(songList[j], userAddress));
      }
    } catch (error) {
      console.error("Get marketplace songs list failed");
    }
    this.songMarketplace = store;
    // this.setState({songMarketplace: store});
    console.log("store", this.songMarketplace);
  }
  async getUserTokens() {
    var userAddress = this.state.myAccountAddress;
    let factoryInstance = await this.state.factoryInstance;
    let tokenAddressess = await factoryInstance.getAllTokensOwnedByUser({
      from: userAddress
    });
    var userTokens = new Array();
    const contract = require("truffle-contract");
    for (let i = 0; i < tokenAddressess.length; i++) {
      const tokenContract = contract(fanToken);
      tokenContract.setProvider(this.state.web3.currentProvider);
      userTokens.push(await tokenContract.at(tokenAddressess[i]));
    }
    this.ownedTokenContracts = userTokens;
    console.log("owned token contracts", this.ownedTokenContracts, userTokens);
    // this.setState({ownedTokenContracts: userTokens});
  }
  async getAllLivePolls() {
    var liveUserPolls = new Array();
    for (let i = 0; i < this.ownedTokenContracts.length; i++) {
      liveUserPolls = await this.getArtistLivePolls(
        this.ownedTokenContracts[i],
        liveUserPolls
      );
    }
    this.livePolls = liveUserPolls;
    console.log("live polls", this.livePolls, liveUserPolls);
    // this.setState({livePolls: liveUserPolls});
  }

  async getArtistLivePolls(tokenInstance, liveUserPolls) {
    let livePollIds = await tokenInstance.getLivePolls({
      from: this.state.myAccountAddress
    });
    var i = 0;
    var tokenDetails = await tokenInstance.getAllTokenDetails();
    var artistDetails = await this.state.contractInstance.getArtistDetailsByAddress(
      tokenDetails[2]
    );
    var tokenName = tokenDetails[0];
    var balance = (await tokenInstance.balanceOf(
      this.state.myAccountAddress
    )).toNumber();
    while (livePollIds[i] != null) {
      let pollDetails = await tokenInstance.getPollDetails(livePollIds[i], {
        from: this.state.myAccountAddress
      });
      var poll = new Object();
      poll.id = livePollIds[i].toNumber();
      poll.tokenInstance = tokenInstance;
      poll.artistId = artistDetails[1].toNumber();
      poll.artistName = artistDetails[0];
      poll.tokenName = tokenName;
      poll.question = pollDetails[0].toString();
      poll.options = await this.parseByte32Array(pollDetails[1]);
      poll.optionVotes = await this.parseUintArray(pollDetails[2]);
      poll.votesPolled = pollDetails[3].toNumber();
      poll.expiryVotes = pollDetails[4].toNumber();
      poll.active = pollDetails[5];
      poll.balance = balance;
      liveUserPolls.push(poll);
      i++;
    }
    return liveUserPolls;
  }
  async getAllPastPolls() {
    var pastUserPolls = new Array();
    for (let i = 0; i < this.ownedTokenContracts.length; i++) {
      pastUserPolls = await this.getArtistPastPolls(
        this.ownedTokenContracts[i],
        pastUserPolls
      );
    }
    this.pastPolls = pastUserPolls;
    console.log("all past polls", this.pastPolls, pastUserPolls);
    // this.setState({pastPolls: pastUserPolls});
  }
  async getArtistPastPolls(tokenInstance, pastUserPolls) {
    let pastPollIds = await tokenInstance.getPastPolls({
      from: this.state.myAccountAddress
    });
    var i = 0;

    var tokenDetails = await tokenInstance.getAllTokenDetails();
    var artistDetails = await this.state.contractInstance.getArtistDetailsByAddress(
      tokenDetails[2]
    );
    var tokenName = tokenDetails[0];
    var balance = (await tokenInstance.balanceOf(
      this.state.myAccountAddress
    )).toNumber();
    while (pastPollIds[i] != null) {
      let pollDetails = await tokenInstance.getPollDetails(pastPollIds[i], {
        from: this.state.myAccountAddress
      });
      var poll = new Object();
      poll.id = pastPollIds[i].toNumber();
      poll.tokenInstance = tokenInstance;
      poll.artistId = artistDetails[1].toNumber();
      poll.artistName = artistDetails[0];
      poll.tokenName = tokenName;
      poll.question = pollDetails[0].toString();
      poll.options = await this.parseByte32Array(pollDetails[1]);
      poll.optionVotes = await this.parseUintArray(pollDetails[2]);
      poll.votesPolled = pollDetails[3].toNumber();
      poll.expiryVotes = pollDetails[4].toNumber();
      poll.active = pollDetails[5];
      poll.balance = balance;
      pastUserPolls.push(poll);
      i++;
    }
    return pastUserPolls;
  }
  async getUserBalanceForToken(tokenInstance) {}
  async castVoteForUser(tokenInstance, pollId, optionId, tokens) {
    let result = await tokenInstance.castVote(pollId, optionId, tokens, {
      from: this.state.myAccountAddress
    });
    console.log(result.tx);
  }
  async transferUserTokens(to, tokens, tokenInstance) {
    let result = await tokenInstance.transfer(to, tokens, {
      from: this.state.myAccountAddress
    });
    console.log(result.tx);
  }
  async parseUintArray(uintArray) {
    var i = 0;
    var parsedArray = new Array();
    while (uintArray[i] != null) {
      parsedArray[i] = uintArray[i].toNumber();
      i++;
    }
    return parsedArray;
  }
  async parseStringArray(stringArray) {
    var i = 0;
    var parsedArray = new Array();
    while (stringArray[i] != null) {
      parsedArray[i] = stringArray[i].toString();
      i++;
    }
    return parsedArray;
  }
  async parseByte32Array(byte32Array) {
    var i = 0;
    var parsedArray = new Array();
    while (byte32Array[i] != null) {
      parsedArray[i] = this.state.web3
        .toAscii(byte32Array[i])
        .replace(/\u0000/g, "");
      i++;
    }
    return parsedArray;
  }
  async getIPFSurl(hash) {
    return "http://127.0.0.1:8080/ipfs/" + hash;
  }
  /**
   * Checks if the given string is an address
   *
   * @method isAddress
   * @param {String} address the given HEX adress
   * @return {Boolean}
   */
  // async isAddress(address) {
  //   if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
  //     // check if it has the basic requirements of an address
  //     return false;
  //   } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
  //     // If it's all small caps or all all caps, return true
  //     return true;
  //   } else {
  //     // Otherwise check each case
  //     return (await this.isChecksumAddress(address));
  //   }
  // };

  // /**
  //  * Checks if the given string is a checksummed address
  //  *
  //  * @method isChecksumAddress
  //  * @param {String} address the given HEX adress
  //  * @return {Boolean}
  //  */
  // async isChecksumAddress(address) {
  //   // Check each case
  //   address = address.replace('0x', '');
  //   var addressHash = sha3(address.toLowerCase());
  //   for (var i = 0; i < 40; i++) {
  //     // the nth letter should be uppercase if the nth digit of casemap is 1
  //     if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
  //       return false;
  //     }
  //   }
  //   return true;
  // };
}

//Poll functions
//Get all live polls
//Cast vote
//Get all past polls
//Transfer tokens

export const dataContainer = new DataContainer();
