pragma solidity ^0.4.23;

//import "./fanTokenFactory.sol";
//import "./musicApp.sol";
import "./SafeMathLib.sol";
import "./ERC20.sol";

contract FanToken is SafeMathLib, ERC20 {
    address ownerArtist;
    address appAddress;
    string Name;
    string Symbol;
    uint artistID;
    uint currentSupply = 0;
    uint TotalSupply = 0;
    uint polls = 0;
    mapping(address => bool) userBought;
    mapping (address => uint) userBalanceOf;
    mapping (uint => _poll) poll;
    enum _pollStatus {LIVE, PAST} 
    struct _poll {
        string question;
        bytes32[] optionText;
        uint[] optionVotes;
        _pollStatus pollStatus;
        uint expiryVotes;
        uint votesPolled;
        mapping(address => bool) userVoted;
    }

    constructor(string _name, string _symbol, uint _artistID, address _artistAddress, address _appAddress) public {
        appAddress = _appAddress;
        Name = _name;
        Symbol = _symbol;
        ownerArtist = _artistAddress;
        artistID = _artistID;
        polls = 0;
    }
    function getAllTokenDetails() public view returns(string,string, address, uint, uint) {
        return (Name,Symbol, ownerArtist, artistID,polls);
    }
    modifier onlyOwnerArtist() {
        require(msg.sender == ownerArtist);
        _;
    }

    modifier ownsSongOrOwnerArtist() {
        require(userBought[msg.sender] == true || msg.sender == ownerArtist);
        _;
    }

    modifier userHasTokens() {
        require(balanceOf(msg.sender) != 0);
        _;
    }

    modifier onlyApp() {
        require(msg.sender == appAddress);
        _;
    }

    event pollCreated(string que,uint pollID, address artistAddress);
    event voteAdded(uint pollID,uint optionID,uint tokens,address userAddress);
    event tokensTransferred(address from,address to,uint amount);

    //--//--//--//--//--//--//--//--//Artist Side//--//--//--//--//--//--//--//--//--//--//--
    function createPoll(string _que, bytes32 _option1, bytes32 _option2, bytes32 _option3, bytes32 _option4, uint _expiryVotes) public onlyOwnerArtist {
        poll[polls].question = _que;
        poll[polls].optionText.push(_option1);
         poll[polls].optionVotes.push(0);
        poll[polls].optionText.push(_option2);
         poll[polls].optionVotes.push(0);
        poll[polls].optionText.push(_option3);
         poll[polls].optionVotes.push(0);
        poll[polls].optionText.push(_option4);
         poll[polls].optionVotes.push(0);
        poll[polls].pollStatus = _pollStatus.LIVE;
        poll[polls].expiryVotes = _expiryVotes;
        emit pollCreated(_que, polls, msg.sender);
        polls++;
    }

    //List of all live polls
    //Workaround to return dynamic sized arrays from solidity
    function getNumberOfLivePolls() public view returns(uint) {
        uint counter = 0;
        for (uint i = 0; i < polls; i++) {
           if(checkPollStatus(i)) {
                counter++;
            } 
        }
        return counter;
    }
    function getLivePolls() public view returns(uint[]) {
        uint j = 0;
        uint[] memory livePolls = new uint[](getNumberOfLivePolls());
        for (uint i = 0; i < polls; i++) {
            if(checkPollStatus(i)) {
                livePolls[j] = i;
                j++;
            }
        }
        return livePolls;
    }    

    function getNumberOfPastPolls() public view returns(uint) {
        uint counter = 0;
        for (uint i = 0; i < polls; i++) {
           if(!checkPollStatus(i)) {
                counter++;
            } 
        }
        return counter;
    }

    function getPastPolls() public view returns(uint[]) {
        uint j = 0;
        uint[] memory pastPolls = new uint[](getNumberOfPastPolls());
        for (uint i = 0; i < polls; i++) {
            if(!checkPollStatus(i)) {
                pastPolls[j] = i;
                j++;
            }
        }
        return pastPolls;
    }       
    //Return variables of struct
    function getPollDetails(uint id) public view ownsSongOrOwnerArtist returns(string, bytes32[], uint[],  uint,  uint, bool) {
        bool pollActive;
        if(checkPollStatus(id)) {
            pollActive = true;
        }
        else {
            pollActive = false;
        }
        // uint totalVotesPolled = ;
        return (
            poll[id].question,
            poll[id].optionText,
            poll[id].optionVotes,
            poll[id].votesPolled,
            poll[id].expiryVotes,
            pollActive //Check if this works
            );
    } 

    //Artist can view how many users own how many tokens and also total tokens used

    function getTokenDetails() public view onlyOwnerArtist returns(uint, uint, uint)  {
        return (TotalSupply, currentSupply, safeSub(TotalSupply, currentSupply));
    }

    //--//--//--//--//--//--//--//--//User Side//--//--//--//--//--//--//--//--//--//--//--
    function balanceOf(address _adr)  public view returns (uint) {
        return userBalanceOf[_adr];
    }

    function castVote(uint _pollID, uint _optionID, uint _tokens) userHasTokens public {
        require(balanceOf(msg.sender) >= _tokens);
        require(checkPollStatus(_pollID));
        require(_pollID <= polls);
        require(_optionID >= 0 && _optionID < 4);   
        poll[_pollID].optionVotes[_optionID]++;
        poll[_pollID].votesPolled++;
        userBalanceOf[msg.sender] = safeSub(userBalanceOf[msg.sender], _tokens);
        //factory.updateUserBalanceOf(msg.sender, artistID, safeMul(-1,_tokens)); //Check For integrity
        currentSupply = safeSub(currentSupply, _tokens);
        poll[_pollID].userVoted[msg.sender] = true;
        voteAdded(_pollID, _optionID, _tokens, msg.sender);
    }   

    //Check again
    
    function transfer(address to, uint _tokens) userHasTokens  public returns (bool) {
        require(balanceOf(msg.sender) >= _tokens);
        userBalanceOf[msg.sender] = safeSub(userBalanceOf[msg.sender], _tokens);
        userBalanceOf[to] = safeAdd(userBalanceOf[to], _tokens);
        userBought[to] = true;
        // factory.updateUserBalanceOf(msg.sender, artistID, safeMul(-1,_tokens));
        // factory.updateUserBalanceOf(to, artistID, _tokens);
        emit Transfer(msg.sender, to, _tokens);
        return true;
    }
    
    function checkPollStatus(uint _pollID) internal returns (bool status) {
        if(poll[_pollID].votesPolled >= poll[_pollID].expiryVotes) {
            poll[_pollID].pollStatus = _pollStatus.PAST;
        }
        if(poll[_pollID].pollStatus == _pollStatus.LIVE) {
            return true;
        }
        else {
            return false;
        }
    }

    function addToken(address userAdr) public onlyApp {
        userBalanceOf[userAdr] = safeAdd(userBalanceOf[userAdr], 1);
        TotalSupply++;
        currentSupply++;
        userBought[userAdr] = true;
    }

    //ERC20 compliance functions  
    function totalSupply() public view returns (uint256) {
        return TotalSupply;
    }
    function allowance(address owner, address spender) public view returns (uint256) {
        return 0;
    }
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf(from) >= value);
        userBalanceOf[from] = safeSub(userBalanceOf[from], value);
        userBalanceOf[to] = safeAdd(userBalanceOf[to], value);
        userBought[to] = true;
        // factory.updateUserBalanceOf(msg.sender, artistID, safeMul(-1,_tokens));
        // factory.updateUserBalanceOf(to, artistID, _tokens);
        emit Transfer(from, to, value);
        return true;
    }
    function approve(address spender, uint256 value) public returns (bool) {
        emit Approval(msg.sender, spender, value);
        return true;
    }
    function name() public view returns (string name) {
        return Name;
    }
    function symbol() view returns (string symbol) {
        return Symbol;
    }
    //helper functions
}