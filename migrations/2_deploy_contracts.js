var musicApp = artifacts.require("./musicApp.sol");
var fantoken = artifacts.require("./FanToken.sol");
var fantokenFactory = artifacts.require("./FanTokenFactory.sol");

var debug = true;
var showABI = false;
var showURL = true;

module.exports = function (deployer, network, accounts) {


    var appInstance;
    var factoryInstance;


    deployer.deploy(fantokenFactory).then(function (Instance) {
        factoryInstance = Instance;
        if (debug) console.log("Factory Deployed Successfully");
        if (debug) console.log("Factory address is: ", factoryInstance.address);
        if (showURL) console.log("Factory URL is: " + getEtherScanUrl(network, factoryInstance.address, "address"));
        if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, factoryInstance.transactionHash, "tx"));
        if (showABI) console.log("Factory ABI is: ", JSON.stringify(factoryInstance.abi));
        if (debug) console.log("\n\n");
        return deployer.deploy(musicApp, factoryInstance.address);
    }).then(function (Instance) {
        //console.log(Instance);
        appInstance = Instance;
        factoryInstance.addAppContractAddress(appInstance.address);
        if (debug) console.log("Music App Deployed Successfully");
        if (debug) console.log("MusicApp address is: ", appInstance.address);
        if (showURL) console.log("MusicApp URL is: " + getEtherScanUrl(network, appInstance.address, "token"));
        if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, appInstance.transactionHash, "tx"));
        if (showABI) console.log("MusicApp ABI is: ", JSON.stringify(appInstance.abi));
        if (debug) console.log("===============================================");
        if (debug) console.log("\n\n");
    });
       // return deployer.deploy(fantoken, "firstToken", 0, factoryInstance.address, appInstance.address);
    // .then(function (Instance) {
    //     //console.log(Instance);
    //     tokenInstance = Instance;
    //     if (debug) console.log("Fan Token Deployed Successfully");
    //     if (debug) console.log("fantoken address is: ", tokenInstance.address);
    //     if (showURL) console.log("fantoken URL is: " + getEtherScanUrl(network, tokenInstance.address, "token"));
    //     if (showURL) console.log("Transaction URL is: " + getEtherScanUrl(network, tokenInstance.transactionHash, "tx"));
    //     if (showABI) console.log("fantoken ABI is: ", JSON.stringify(tokenInstance.abi));
    //     if (debug) console.log("===============================================");
    //     if (debug) console.log("\n\n");
    // });

    function getEtherScanUrl(network, data, type) {
        var etherscanUrl;
        if (network == "ropsten" || network == "kovan") {
            etherscanUrl = "https://" + network + ".etherscan.io";
        } else {
            etherscanUrl = "https://etherscan.io";
        }
        if (type == "tx") {
            etherscanUrl += "/tx";
        } else if (type == "token") {
            etherscanUrl += "/token";
        } else if (type == "address") {
            etherscanUrl += "/address";
        }
        etherscanUrl = etherscanUrl + "/" + data;
        return etherscanUrl;
    }

    function etherInWei(x) {
        return web3.toBigNumber(web3.toWei(x, 'ether')).toNumber();
    }


    function tokenPriceInWeiFromTokensPerEther(x) {
        if (x == 0) return 0;
        return Math.floor(web3.toWei(1, 'ether') / x);
    }

    function getUnixTimestamp(timestamp) {
        var startTimestamp = new Date(timestamp);
        return startTimestamp.getTime() / 1000;
    }


    function tokenInSmallestUnit(tokens, _tokenDecimals) {
        return tokens * Math.pow(10, _tokenDecimals);
    }
}