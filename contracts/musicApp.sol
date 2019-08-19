pragma solidity ^0.4.23;

import "./FanToken.sol";
import "./FanTokenFactory.sol";
//TODO: decimal point in dollar data handling

contract musicApp is SafeMathLib {

    //Global Variables
    
    struct _song {
        string songHash;
        uint songID;
        string name;
        uint artistID; //Might be redundant 
        string songArtHash;
        uint256 priceInD;
        uint256 totalSold;
        uint256 totalRevenues;
        uint256 latestWeiPrice;
    }

    struct _artist {
        string artistDPHash;
        uint id;
        string name;
        string description;
        address adr;
        uint[] songs; // Keep track of all songs the particular artist has made. List of song IDs.
        uint totalEarningsInD;
    }

    struct _user {
        uint[] songsOwned; //We cannot have an array of strings + mapping - index to song ids
        uint userID; // Same as mapping index    
        uint totalSongsOwned;
    }
    
    //Artist mappings
    mapping (uint => address) private artistAddressOf;
    mapping (address => _artist) private artist;
    uint artists = 0;

    //Song Mappings
    mapping (uint => string) private songHashOf;
    mapping (uint => _song) private song; //mapping of song ID to song struct as it is the most frequently passed parameter
    uint songs = 1; //NOTIFY OF THIS

    mapping(uint => address) artistOf; //Maps songIDs to artist address

    //User mappings
    mapping (uint => address) userAddressOf;
    mapping (address => _user) user;
    uint users = 0;

    FanTokenFactory tokenFactory;
    address ownerAddress;

    //Events
    //Modifiers
    modifier validArtist() {
        require(artist[msg.sender].id >= 0 && artist[msg.sender].id < artists);
        require(artistAddressOf[artist[msg.sender].id] == msg.sender); //Cross checking
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress);
        _;
    }
    modifier ownsSong(uint _songID) {
        require(user[msg.sender].userID >= 0 && user[msg.sender].userID < users); //Check if valid user
        uint f = 0;
        for(uint i = 0; i < user[msg.sender].totalSongsOwned; i++) {
            if(user[msg.sender].songsOwned[i] == _songID) {
                f = 1;
                break;
            }
            }
        require(f==1);
        _;
    } 

    modifier validUser(address _adr) {
        require(user[_adr].userID >= 0 && user[_adr].userID < users);
        _;
    }
    modifier newUser() {
        uint f=0;
        for(uint i = 0; i < users; i++) {
            if(userAddressOf[i] == msg.sender) {
                f=1;
            }
        }
        require(f==0);
        _;
    }
    //events
    event singleArtistRegistered(string _name, uint artistID);
    event songAdded(string _title,uint _priceInD,uint songID);
    event userRegistered(address userAddress,uint userID);
    event songBuySuccessful(uint _songID,address userAddress);

    // // Helper Functions
    // function compareStrings (string a, string b) public view returns (bool){
    //     return keccak256(a) == keccak256(b);
    // }

    //constructor
    constructor (address factoryAddress) {
        tokenFactory = FanTokenFactory(factoryAddress);
        ownerAddress = msg.sender;
    }

    // function addFactoryTokenAddress(address _tokenFactory) onlyOwner public {
    //     // require(tokenFactory == 0); Find another way to check this
    //     tokenFactory = FanTokenFactory(tokenFactory);
    // }
    uint constant weiThreshold = 698844576966082; // 30 cents- threshold for allowing people 
    //Artist side functions

    //Create artist
    // TODO: Multisig implementation

    // Called when web3 indicates single owner account
    function registerSingleArtist(string _name, string _desc, string _pictureHash) public returns(address tokenAddress) {
        artistAddressOf[artists] = msg.sender;
        artist[msg.sender].artistDPHash = _pictureHash;
        artist[msg.sender].name = _name; 
        artist[msg.sender].description = _desc;
        artist[msg.sender].adr = msg.sender;
        artist[msg.sender].id = artists;
        artist[msg.sender].totalEarningsInD = 0;
        address token = tokenFactory.createFanToken(artists, _name, msg.sender);
        emit singleArtistRegistered(_name, artists);
        artists++;
        return token;
        // songs
    }

    //Upload music
    function addSong(string _songHash, string _title, uint256 _priceInD, string _songArtHash) public validArtist {
        songHashOf[songs] = _songHash;
        artistOf[songs] = msg.sender;
        song[songs].songID = songs;
        song[songs].songHash = _songHash;
        song[songs].name = _title;
        song[songs].artistID = artist[msg.sender].id;
        song[songs].priceInD = _priceInD;
        song[songs].songArtHash = _songArtHash;
        emit songAdded(_title, _priceInD, songs);
        songs++;
    }

    function checkTotalRevenues()  public view validArtist returns (uint) {
        return artist[msg.sender].totalEarningsInD;
    }

    function checkSongRevenues(uint _songID) public view validArtist returns (uint) {
        return song[_songID].totalRevenues;
    }
    
    function checkSanity(uint n, uint _songID) public view returns (bool) {
        uint256 latestPrice = song[_songID].latestWeiPrice;
        if( n < safeAdd(latestPrice, weiThreshold) && n > safeSub(latestPrice, weiThreshold)) {
            return true;
        }
        else {
            return false;
        }
        //return safeAdd(latestPrice, weiThreshold);
        //return latestPrice;
    }
    //WIthdraw fund function to be implemented with multisig wallet

    function dollarToWei(uint _dollars) public returns(uint) {
        return 1000000000000000000;
    }

    //--//--//--//--//--//--//--//--//--//User side//--//--//--//--//--//--//--//--//--//--//-- 
    function checkIfNewUser(address adr) public view returns (bool) {
        uint f=0;
        for(uint i = 0; i < users; i++) {
            if(userAddressOf[i] == adr) {
                return false;
            }
        }
        return true;
    } 
    function registerUser() public {
        require(checkIfNewUser(msg.sender) == true);
        userAddressOf[users] = msg.sender;
        user[msg.sender].userID = users;
        emit userRegistered(msg.sender, users);
        users++;
    }
    
    function initiateBuy(uint _songID) validUser(msg.sender) public {
        song[_songID].latestWeiPrice = dollarToWei(song[_songID].priceInD);
    }
    function getLatestWeiPrice(uint _songID) validUser(msg.sender) public view returns(uint256) {
        return song[_songID].latestWeiPrice;
    }
    //Buy music - ETH-$ concepth
    function buySong(uint _songID) validUser(msg.sender) public payable {
        require(!userOwns(_songID),"User already owns song");
        uint256 latestPrice = song[_songID].latestWeiPrice;
        require(msg.value < safeAdd(latestPrice, weiThreshold) && msg.value > safeSub(latestPrice, weiThreshold), "Amount not valid!");
        this.transfer(msg.value); //TODO: require confirmation of funds transferred
        user[msg.sender].totalSongsOwned = user[msg.sender].songsOwned.push(_songID);
        song[_songID].totalSold++;
        song[_songID].totalRevenues = safeAdd(song[_songID].totalRevenues, song[_songID].priceInD);
        artist[artistOf[_songID]].totalEarningsInD = safeAdd(artist[artistOf[_songID]].totalEarningsInD, song[_songID].priceInD);
        FanToken fanToken = FanToken(tokenFactory.getTokenAddressOf(artist[artistOf[_songID]].id));
        fanToken.addToken(msg.sender);
        emit songBuySuccessful(_songID, msg.sender);
    }

    function getSongHashByID(uint _songID) public view ownsSong(_songID) returns(string) {
        return songHashOf[_songID];
    }

    function getSongDetails(uint _songID) public view ownsSong(_songID) returns(string, string, string, string) {
        return (songHashOf[_songID],song[_songID].name, song[_songID].songArtHash, artist[artistOf[_songID]].name);
    }

    //Vote - token contract
    // Display library functions
    function getUserSongList() public view validUser(msg.sender) returns (uint[])   {
        uint[] memory songList = new uint[](user[msg.sender].totalSongsOwned);
        songList = user[msg.sender].songsOwned; //Check if this works
        return songList;
    }

    // Display store list
    //Check if this is needed. App will have a list of all song ids with it at all times
    // Dont display IDs that are akready owned by user. 
    function getStoreSongList() public view validUser(msg.sender) returns (uint[]) {
        uint[] memory allSongList = new uint[](songs-1-user[msg.sender].totalSongsOwned); //Check how to make this work?
        uint j=0;
        for(uint i = 1; i < songs; i++){
            if(userOwns(i) == false) {
                allSongList[j] = i;
                j++;
            }
        }
        return allSongList;
    }

    function userOwns(uint _songId) public view returns(bool) {
       require(user[msg.sender].userID >= 0 && user[msg.sender].userID < users); //Check if valid user
        uint f = 0;
        for(uint i = 0; i < user[msg.sender].totalSongsOwned; i++) {
            if(user[msg.sender].songsOwned[i] == _songId) {
                f = 1;
                break;
            }
            }
        if(f==1){
            return true;
        }
        else {
            return false;
        }
    }

    function getSongStoreDetails(uint _songID) public view validUser(msg.sender) returns(string, string, string, uint) {
        return (song[_songID].name, song[_songID].songArtHash, artist[artistOf[_songID]].name, song[_songID].priceInD); 
    }
    //TODO:upgrade logic
    //TODO: Self destruct
    function () payable public {
    }

    function getTotalArtists() public view returns(uint) {
        return artists;
    }
    function getTotalSongs() public view returns (uint) {
        return (songs-1);
    }
    function userValidityCheck() public view validUser(msg.sender) returns(bool) {
        if(user[msg.sender].userID >= 0 && user[msg.sender].userID < users) {
            return true;
        }       
        else {
            return false;
        }
    }
    function getArtistIdBySongId(uint songId) public view returns(uint) {
        return artist[artistOf[songId]].id;
    }
    function getArtistDetailsByAddress(address adr) public view returns (string, uint) {
        return (artist[adr].name, artist[adr].id);
    }

}