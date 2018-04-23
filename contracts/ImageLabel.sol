pragma solidity ^0.4.17;

import "./JobManager.sol";


contract ImageLabel {

    // we can make this hacky and easy by always making numLabellers gameType + 2
    uint8 public gameType;
    string public imageLink;
    string public query;
    address public owner;
    uint public bounty;
    JobManager public manager;
    uint16 public index;

    address[] public agents;
    mapping(address => int8) public addrToAns;
    mapping(address => bool) public settled;

    uint8 public numClaimers = 0;
    uint8 public numAnswered = 0;

    mapping (address => uint) public amountEarned;
    mapping(address => uint) public pendingWithdrawals;

  	modifier hasBeenAssigned(ImageLabel job, address addr){
        require(manager.jobAssigned(job, addr));
         _;
    }
    modifier notSettled() {require(!(isSettled())); _;}
    modifier answered() {require(numAnswered == gameType); _;}

    /* A MT can claim this contract by now + _claimWindow */
    constructor(
        string _imageLink,
        string _query,
        uint8 _gameType,
        address _manager,
        uint16 _index
    )
    public
    payable
    {
        owner = msg.sender;
        imageLink = _imageLink;
        query = _query;
        bounty = msg.value;
        gameType = _gameType;
        manager = JobManager(_manager);
        index = _index;
    }

    function getEarnings() public returns (uint){
        return amountEarned[msg.sender];
    }

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    function claimJob()
        public
        returns (bool)
    {
        manager.upsertLabeller(msg.sender);

        manager.giveJob(msg.sender, this);

        agents.push(msg.sender);
        numClaimers += 1;

        /* if (numClaimers == gameType){
            manager.markClaimed(this);
        } */

        return true;
    }


    function esp()
        notSettled()
        answered()
        private
        returns (bool)
    {
        if (addrToAns[agents[0]] == addrToAns[agents[1]]){
            pendingWithdrawals[agents[0]] = bounty/2;
            pendingWithdrawals[agents[1]] = bounty/2;
            return true;
        }
        return false;
    }

    function majority()
        notSettled()
        answered()
        private
        returns (bool) {
        if (addrToAns[agents[0]] == addrToAns[agents[1]] && addrToAns[agents[1]] == addrToAns[agents[2]]){
            pendingWithdrawals[agents[0]] = bounty/3;
            pendingWithdrawals[agents[1]] = bounty/3;
            pendingWithdrawals[agents[2]] = bounty/3;
            return true;
        }
        else if (addrToAns[agents[0]] == addrToAns[agents[1]]){
            pendingWithdrawals[agents[0]] = bounty/2;
            pendingWithdrawals[agents[1]] = bounty/2;
            return (msg.sender == agents[0] || msg.sender == agents[1]);
        }
        else if (addrToAns[agents[0]] == addrToAns[agents[2]]){
            pendingWithdrawals[agents[0]] = bounty/2;
            pendingWithdrawals[agents[2]] = bounty/2;
            return (msg.sender == agents[0] || msg.sender == agents[2]);
        }
        else if (addrToAns[agents[1]] == addrToAns[agents[2]]){
            pendingWithdrawals[agents[1]] = bounty/2;
            pendingWithdrawals[agents[2]] = bounty/2;
            return (msg.sender == agents[1] || msg.sender == agents[2]);
        }
        return false;
    }

    function consensus()
        notSettled()
        answered()
        private
        returns (bool)
    {
        return true;
    }

    function isSettled() public returns (bool){
        return settled[msg.sender];
    }

    function settle()
        notSettled()
        answered()
        public
        returns (bool)
    {
        bool isPaid;
    	if (gameType == 2){
            isPaid = esp();
        }
      	else if (gameType == 3){
            isPaid = majority();
        }
        /* else if (gameType > 3){
            isPaid = consensus();
        } */

        uint amount = pendingWithdrawals[msg.sender];
        if (isPaid){
            manager.updateStreak(this, msg.sender);
            amountEarned[msg.sender] = pendingWithdrawals[msg.sender];
            pendingWithdrawals[msg.sender] = 0;
            if (!msg.sender.send(amount)){
                // No need to call throw here, just reset the amount owing
                pendingWithdrawals[msg.sender] = amount;
                return false;
            }
        }
        else{
            manager.updateStreak(this, msg.sender);
        }
        settled[msg.sender] = true;
        return true;
    }

    function answerJob(int8 answer)
        public
        hasBeenAssigned(this, msg.sender)
        returns (int8)
    {
        addrToAns[msg.sender] = answer;
        numAnswered += 1;
        return answer;
    }

    function claimAnswerJob(int8 answer)
        public
        returns(int8)
    {
        claimJob();
        int8 retVal = answerJob(answer);
        return retVal;
    }

    function availableJob() public returns (bool){
        return (numClaimers < gameType);
    }

    function positiveWithdrawal(address addr) public returns (bool){
        return (pendingWithdrawals[addr] > 0);
    }
}

// Add cancellation
// Add refresh
