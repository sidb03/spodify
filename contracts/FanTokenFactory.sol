pragma solidity ^0.4.23;

import "./musicApp.sol";
// import "./SafeMathLib.sol";


contract FanTokenFactory is SafeMathLib {
    address owner;
    address appContract;
    modifier onlyAppContract() {
        require(msg.sender == appContract);
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    mapping (uint => address) public FanTokenOf; //Here, the uint is same as artist ID. THis is done to help maintain consistency in the IDs.
    event fanTokenCreated(uint _artistID,address tokenAddress, string _name);
    event userTokenBalanceUpdated(uint tokenBalance,address userAddress);
    constructor () public {
        owner = msg.sender;
    }

    function addAppContractAddress(address _appContract) public onlyOwner {
        appContract = _appContract;
    }
    //Helper
    function getOwner() public view returns(address) {
        return owner;
    }
    //helper
    function getAppAddress() public view returns (address) {
        return appContract;
    }
    //We'll name the token as teh artist name as, to create custom token names we need to concatenate strings which consumes unecessary gas as it needss to be done manually. for reference:https://stackoverflow.com/questions/32157648/string-concatenation-in-solidity
    function createFanToken(uint _artistID, string _name, address _artistAddress) public  returns(address){
        //require(FanTokenOf[_artistID] == 0);
        FanTokenOf[_artistID] = new FanToken(_name,_name, _artistID, _artistAddress, appContract);//TODO:SYmbol logic
        fanTokenCreated(_artistID, FanTokenOf[_artistID], _name);
        return FanTokenOf[_artistID];
    }
    // getAll balances for user along with addresses
    function getTokenAddressOf(uint artistID) public view returns(address) {
        return FanTokenOf[artistID];
    }
    // function updateUserBalanceOf(address _userAdr, uint _artistID, int _change) internal {
    //     user[_userAdr].fanTokenBalanceOf[_artistID] = safeAdd(user[_userAdr].fanTokenBalanceOf[_artistID], _change);
    //     userTokenBalanceUpdated(user[_userAdr].fanTokenBalanceOf[_artistID], msg.sender);
    // }
    function getNumberOfTokensOwnedByUser() internal returns(uint) {
        uint j=0;
        for (uint i = 0;i < musicApp(appContract).getTotalArtists(); i++) {
            if(FanToken(FanTokenOf[i]).balanceOf(msg.sender) != 0) {
                j++;
            }
        }
        return j;
    }
    function getAllTokensOwnedByUser() public view returns(address[]) {
        address[] memory tokenAddresses = new address[](getNumberOfTokensOwnedByUser());
        uint j = 0;
        for (uint i = 0;i < musicApp(appContract).getTotalArtists(); i++) {
            if(FanToken(FanTokenOf[i]).balanceOf(msg.sender) != 0) {
                tokenAddresses[j] = getTokenAddressOf(i);
                j++;
            }
        }
        return tokenAddresses;
    }
}