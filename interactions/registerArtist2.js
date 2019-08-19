var musicApp = artifacts.require("./musicApp.sol");
var factory = artifacts.require("./FanTokenFactory.sol");
var fanToken = artifacts.require("./FanToken.sol");

var artist1 = web3.eth.accounts[1];
var artist2 = web3.eth.accounts[2];
var owner = web3.eth.accounts[0];


module.exports = async function (callback) {
    console.log("Registering 1st artist!");
    await registeringSingleArtist("Bon Iver", "My 2nd fav artist", "randomHash", artist2);
}    

function registeringSingleArtist(artistName, artistDesc, songhash, artistAddress) {
    return musicApp.deployed()
        .then(function (instance) {
            return instance.registerSingleArtist(artistName, artistDesc, songhash, {
                from: artistAddress
            });
        })
        .then(function (result) {
            console.log("\n Registered Artist", artistName);
            console.log(result.tx);
            return true;
        }).catch(function (e) {
            console.log("ERROR registering artist");
            return false;
        });
}

