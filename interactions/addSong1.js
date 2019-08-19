var musicApp = artifacts.require("./musicApp.sol");
var factory = artifacts.require("./FanTokenFactory.sol");
var fanToken = artifacts.require("./FanToken.sol");

var artist1 = web3.eth.accounts[1];
var artist2 = web3.eth.accounts[2];
var owner = web3.eth.accounts[0];

module.exports = async function (callback) {
    console.log("\nAdding song for vance! Georgia!");
    await addSongs("randomHash", "Georgia", "2", "RandomHash", artist1);
}
function addSongs(songhash, songTitle, price, artHash, artistAddress) {
    return musicApp.deployed()
        .then(function (instance) {
            return instance.addSong(songhash, songTitle, price, artHash, {
                from: artistAddress
            });
        })
        .then(function (result) {
            console.log("\n Added Song!");
            console.log(result.tx);
            return true;
        }).catch(function (e) {
            console.log("ERROR adding song");
            return false;
        });
}