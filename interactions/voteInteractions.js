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

    console.log("Getting tokens for users");
    console.log("For user1");
    await getUserTokens(user1);
    console.log("For user2");
    await getUserTokens(user2);

    console.log("Attempting to create a poll for Artist1");
    await createAPoll("How?", "A", "B", "C", "D", 1, artist1, 0);

    console.log("Attempting to create a poll for Artist2");
    await createAPoll("What?", "A1", "1B", "C1", "1D", 1, artist2, 1);
    // console.log("\n Getting live polls for User..");
    // await getAllLivePolls(0, user1);

    console.log("\n Getting Token Details for artist.");
    await getAllTokenDetails(0, artist1); //Artist
    console.log("\n Getting Token Details for artist.");
    await getAllTokenDetails(1, artist2); //Artist
    console.log("\n Getting live polls for Artist1..");
    await getAllLivePolls(0, artist1);//User
    console.log("\n Getting live polls for Artist..");
    await getAllLivePolls(1, artist2);

    console.log("Transferring token from user1 to user2");
    await transferUserTokens(0, user2, 1, user1);
    await transferUserTokens(0, user1, 1, user2);

    console.log("\n Casting vote for user2 for artist1");
    await castVoteForUser(0,0, user2);//User
    console.log("\n Casting vote for user2 for artist2");
    await castVoteForUser(1,0, user2);

    console.log("\n Getting past polls for Artist1..");
    await getAllPastPolls(0, artist1);//User
    console.log("\n Getting past polls for Artist2..");
    await getAllPastPolls(1, artist2);
    console.log("\n Getting past polls for user1..");
    await getAllPastPolls(0, user1);
    console.log("\n Getting past polls for user2..");
    await getAllPastPolls(1, user2);

    console.log("\n Getting Token Details for artist.");
    await getAllTokenDetails(0, artist1);
    console.log("\n Getting Token Details for artist.");
    await getAllTokenDetails(1, artist2);
    callback();
}
async function getUserTokens(userAddress) {
    let factoryInstance = await factory.deployed();
    let tokenAddressess = await factoryInstance.getAllTokensOwnedByUser({
        from: userAddress
    });
    console.log(tokenAddressess);
}
async function createAPoll(question, option1, option2, option3, option4, expiry, userAddress, artistId) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    let tokenInstance = await fanToken.at(tokenAddress);
    let result = await tokenInstance.createPoll(question, web3.fromAscii(option1), web3.fromAscii(option2), web3.fromAscii(option3), web3.fromAscii(option4), expiry, {from:  userAddress});
    console.log(result.tx);
}
async function getAllLivePolls(artistId, userAddress) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    let tokenInstance = await fanToken.at(tokenAddress);
    let numberOfLivePolls = await tokenInstance.getNumberOfLivePolls();
    console.log("Number of live polls:", numberOfLivePolls.toNumber());
    let livePollIds = await tokenInstance.getLivePolls({from: userAddress});
    var i = 0;
    var livePolls = new Array();
    while(livePollIds[i] != null) {
        let pollDetails = await tokenInstance.getPollDetails(livePollIds[i], {from: userAddress});
        var poll = new Object();
        poll.question = pollDetails[0].toString();
        poll.options = await parseByte32Array(pollDetails[1]);
        poll.optionVotes = await parseUintArray(pollDetails[2]);
        poll.votesPolled = pollDetails[3].toNumber();
        poll.expiryVotes = pollDetails[4].toNumber();
        poll.active = pollDetails[5];
        livePolls.push(poll);
        i++;
    }
    console.log(livePolls);
}
async function getAllPastPolls(artistId, userAddress) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    let tokenInstance = await fanToken.at(tokenAddress);
    let numberOfPastPolls = await tokenInstance.getNumberOfPastPolls();
    console.log("Number of past polls:", numberOfPastPolls.toNumber());
    let pastPollIds = await tokenInstance.getPastPolls({from: userAddress});
    var i = 0;
    var pastPolls = new Array();
    while(pastPollIds[i] != null) {
        let pollDetails = await tokenInstance.getPollDetails(pastPollIds[i], {from: userAddress});
        var poll = new Object();
        poll.question = pollDetails[0].toString();
        poll.options = await parseByte32Array(pollDetails[1]);
        poll.optionVotes = await parseUintArray(pollDetails[2]);
        poll.votesPolled = pollDetails[3].toNumber();
        poll.expiryVotes = pollDetails[4].toNumber();
        poll.active = pollDetails[5];
        pastPolls.push(poll);
        i++;
    }
    console.log(pastPolls);
}
async function getAllTokenDetails(artistId, userAddress) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    let tokenInstance = await fanToken.at(tokenAddress);
    let tokenDetails = await tokenInstance.getTokenDetails({from: userAddress});
    console.log(await parseUintArray(tokenDetails));
    console.log("\nTotal Supply:",tokenDetails[0].toNumber());
    console.log("\n Current Supply:",tokenDetails[1].toNumber());
}
async function castVoteForUser(artistId, pollid, userAddress) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    let tokenInstance = await fanToken.at(tokenAddress);
    let result = await tokenInstance.castVote(pollid, 1, 1, {from: userAddress});
    console.log(result.tx);
}
async function transferUserTokens(artistId, to, tokens, userAddress) {
    let factoryInstance = await factory.deployed();
    let tokenAddress = await factoryInstance.getTokenAddressOf(artistId);
    let tokenInstance = await fanToken.at(tokenAddress);
    let result = await tokenInstance.transfer(to, tokens, {from: userAddress});
}
async function parseUintArray(uintArray) {
    var i = 0;
    var parsedArray = new Array();
    while (uintArray[i] != null) {
        parsedArray[i] = uintArray[i].toNumber();
        i++;
    }
    return parsedArray;
}
async function parseStringArray(stringArray) {
    var i = 0;
    var parsedArray = new Array();
    while (stringArray[i] != null) {
        parsedArray[i] = stringArray[i].toString();
        i++;
    }
    return parsedArray;
}
async function parseByte32Array(byte32Array) {
    var i = 0;
    var parsedArray = new Array();
    while (byte32Array[i] != null) {
        parsedArray[i] = web3.toAscii(byte32Array[i]).replace(/\u0000/g, '');
        i++;
    }
    return parsedArray;
}