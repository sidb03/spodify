var musicApp = artifacts.require("./musicApp.sol");
var factory = artifacts.require("./FanTokenFactory.sol");
var fanToken = artifacts.require("./FanToken.sol");

var user1 = web3.eth.accounts[3];
var user2 = web3.eth.accounts[4];
var artist1 = web3.eth.accounts[1];
var artist2 = web3.eth.accounts[2];
var owner = web3.eth.accounts[0];
var nonUser = web3.eth.accounts[5];

module.exports = async function (callback) {
    console.log("Registering 1st artist!");
    await registeringSingleArtist("Vance Joy", "My fav artist", "randomHash", web3.eth.accounts[1]);
    console.log("Registering 2nd artist!");
    await registeringSingleArtist("Bon Iver", "My 2nd fav artist", "randomHash", web3.eth.accounts[2]);

    console.log("Registering 1st user!");
    await registeringUser("Sid", user1);
    console.log("Registering 2nd user!");
    await registeringUser("Nik", user2);


    console.log("\n Adding songs now!");
    console.log("\nAdding song for vance! Georgia!");
    await addSongs("randomHash", "Georgia", "2", "RandomHash", artist1);
    console.log("\nAdding song for bon! Holocene!");
    await addSongs("randomHash", "Holocene", "3", "RandomHash", artist2);

    console.log("\n \n Added all songs successfullly!");

    console.log("Checking deployed token details:");
    console.log("Deployed token 1");
    await getTokenDetails(0);
    console.log("\n\n");
    console.log("Deployed token 2");
    await getTokenDetails(1);

    console.log("Loading Store.....");
    await loadStore(user1);
    console.log("\n\n");

    console.log("Initating Buy!");
    await callInitiateBuy(1, user1);
    console.log("Attempting Buy....");
    await callBuy(1, user1);

    console.log("Initating Buy!");
    await callInitiateBuy(2, user2);
    console.log("Attempting Buy....");
    await callBuy(2, user2);

    console.log("\n\n");
    console.log("Getting song libray for user 1");
    await loadLibrary(user1);
    console.log("Getting song libray for user 2");
    await loadLibrary(user2);

    console.log("\n\n");
    console.log("Checking total revenues");
    //await getTotalRevenues(artist1);

    // console.log("Checking song revenues");
    // await getSongRevenues(artist1, 1);
    console.log("Getting user tokens0");
    await getUserTokens(user1);
    console.log("Getting user tokens0");
    await getUserTokens(user2);
    callback();
}

async function getTokenDetails(i) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(i);
    console.log(tokenAddress);
    let tokenInstance = await fanToken.at(tokenAddress);
    let details = await tokenInstance.getAllTokenDetails();
    console.log(details[3].toNumber());
}

function registeringUser(name, userAddress) {
    return musicApp.deployed()
        .then(function (instance) {
            return instance.registerUser(name, {
                from: userAddress
            });
        })
        .then(function (result) {
            console.log("\n Registered user");
            console.log(result.tx);
            return true;
        }).catch(function (e) {
            console.log("ERROR registering user");
            return false;
        });
}

function registeringSingleArtist(artistName, artistDesc, songhash, artistAddress) {
    return musicApp.deployed()
        .then(function (instance) {
            return instance.registerSingleArtist(artistName, artistDesc, songhash, {
                from: artistAddress
            });
        })
        .then(function (result) {
            console.log("\n Registered Artist");
            console.log(result.tx);
            return true;
        }).catch(function (e) {
            console.log("ERROR registering artist");
            return false;
        });
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

async function loadStore(userAddress) {
    let appInstance = await musicApp.deployed();
    let songList = await appInstance.getStoreSongList({
        from: userAddress
    });
    let i = 0;
    var store = new Array();
    while (songList[i] != null) {
        store.push(await getStoreSongDetails(songList[i], userAddress));
        i++;
    }
    console.log(store);
}
async function getStoreSongDetails(songID, userAddress) {
    var obj = new Object();
    let appInstance = await musicApp.deployed();
    let songDetails = await appInstance.getSongStoreDetails(songID, {
        from: userAddress
    });
    obj.songName = songDetails[0];
    obj.picAddress = songDetails[1];
    obj.artistName = songDetails[2];
    obj.price = songDetails[3].toNumber();
    return obj;
}
async function loadLibrary(userAddress) {
    let appInstance = await musicApp.deployed();
    let songList = await appInstance.getUserSongList({
        from: userAddress
    });
    var library = new Array();
    let i = 0;
    //console.log(songList);
    while (songList[i] != null) {
        library.push(await getSongDetails(songList[i], userAddress));
        i++;
    }
    console.log(library);
}
async function getSongDetails(songID, userAddress) {
    let appInstance = await musicApp.deployed();
    var obj = new Object();
    let songDetails = await appInstance.getSongDetails(songID, {
        from: userAddress
    });
    obj.songHash = songDetails[0];
    obj.songName = songDetails[1];
    obj.picAddress = songDetails[2];
    obj.artist = songDetails[3];
    return obj;
}


async function callInitiateBuy(songId, userAddress) {
    console.log("Initiating song buy!");
    let appInstance = await musicApp.deployed();
    await appInstance.initiateBuy(songId, {
        from: userAddress
    });
    let weiPrice = await appInstance.getLatestWeiPrice(songId);
    console.log(weiPrice.toNumber());
}

async function callBuy(songId, userAddress) {
    let appInstance = await musicApp.deployed();
    let factoryInstance = await factory.deployed();
    let artistId = await appInstance.getArtistIdBySongId(songId);
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    console.log(tokenAddress);
    let tokenInstance = await fanToken.at(tokenAddress);
    await appInstance.initiateBuy(songId, {
        from: userAddress
    });
    let weiPrice = await appInstance.getLatestWeiPrice(songId);
    console.log(weiPrice.toNumber());
    let result = await appInstance.buySong(songId, {
        from: userAddress,
        value: 1000000000000000000
    });
    console.log(result.tx);
    let userBalance = await tokenInstance.balanceOf(userAddress);
    console.log("User token balance:", userBalance.toNumber());
}

// async function getOwnedSongDetails(songID, userAddress) {
//     let appInstance = await musicApp.deployed();
//     let songDetails = await appInstance.getSongDetails(songID, {
//         from: userAddress
//     });
//     console.log(songDetails);
// }

// async function getSongHash(songID, userAddress) {
//     let appInstance = await musicApp.deployed();
//     let songDetails = await appInstance.getSongHashByID(songID, {
//         from: userAddress
//     });
//     console.log(songDetails);
// }
async function getUserTokens(userAddress) {
    let factoryInstance = await factory.deployed();
    let appInstance = await musicApp.deployed();
    let tokenAddressess = await factoryInstance.getAllTokensOwnedByUser({
        from: userAddress
    });
    console.log(tokenAddressess);
}
async function parseUintArray(uintArray) {
    var i = 0;
    while (uintArray[i] != null) {
        parsedArray[i] = uintArray[i].toNumber();
        i++;
    }
    return parsedArray;
}
async function parseStringArray(stringArray) {
    var i = 0;
    while (stringArray[i] != null) {
        parsedArray[i] = stringArray[i].toString();
        i++;
    }
    return parsedArray;
}
async function parseByte32Array(byte32Array) {
    var i = 0;
    while (byte32Array[i] != null) {
        parsedArray[i] = web3.toAscii(byte32Array[i]);
        i++;
    }
    return parsedArray;
}

// async function getTotalRevenues(userAddress) {
//     let appInstance = musicApp.deployed();
//     let revenues = await appInstance.checkTotalRevenues({
//         from: userAddress
//     });
//     console.log(revenues.toNumber());
//     }

// async function getSongRevenues(userAddress, songID) {
//     let appInstance = musicApp.deployed();
//     let revenues = await appInstance.checkSongRevenues(songID, {
//         from: userAddress
//     });
//     console.log(revenues.toNumber());
// }
//Add factory token i - done in constructor

//Artist Side Functions
// Register single artist x2 accounts[1], accounts[2]
// Add song x1, x2
//

