pragma solidity ^0.4.17;

import "./JobManager.sol";


contract ImageLabel {

    // we can make this hacky and easy by always making numLabellers gameType + 2
    /* int8 public numLabellers = 2; */
    int8 public gameType;
    string public imageLink;
    string public query;
    address public owner;
    uint public bounty;
    uint public claimDeadline;
    uint public answerDeadline;
    JobManager public manager;
    uint public index;

    address[] public agents;
    mapping(address => int8) public addrToAns;

    int8 public numClaimers = 0;
    int8 public numAnswered = 0;
    bool public settled = false;

    mapping(address => uint) public pendingWithdrawals;

    modifier afterTime(uint _time) { require(now > _time); _; }
    modifier beforeTime(uint _time) { require(now < _time); _; }
  	modifier hasBeenAssigned(ImageLabel job, address addr){
        require(manager.jobAssigned(job, addr));
         _;
    }
    modifier notSettled() {require(!settled); _;}
    modifier answered() {require(numAnswered == gameType); _;}

    /* A MT can claim this contract by now + _claimWindow */
    function ImageLabel(
        string _imageLink,
        string _query,
        uint _claimWindow,
        uint _answerWindow,
        uint _gameType,
        address _manager,
        uint _index
    )
    public
    payable
    {
        owner = msg.sender;
        imageLink = _imageLink;
        query = _query;
        bounty = msg.value;
		gameType = int8(_gameType);
        claimDeadline = now + _claimWindow;
        answerDeadline = claimDeadline + _answerWindow;
        manager = JobManager(_manager);
        index = _index;
    }

    /* function setLabellerIndex(address addr, int8 newIndex) private returns (bool){
        addrToAns[addr] = LabellerStatus(true, newIndex);
        return assignedIndex[addr].assigned;
    }

    function getLabellerIndex(address addr) private view returns (int8){
          LabellerStatus storage ls = assignedIndex[addr];
          if (ls.assigned == false){
            	return -1;
          }
          else{
            	return ls.index;
          }
      } */

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    function claimJob()
        public
        /* beforeTime(claimDeadline) */
        returns (bool)
    {
        /* int8 newIndex = numClaimers; */
        manager.upsertLabeller(msg.sender);

        manager.giveJob(msg.sender, this);

        /* agents[uint()] = manager.labellers(msg.sender); */

        agents.push(msg.sender);
        /* addrToAns[msg.sender] = -1; */
        /* setLabellerIndex(msg.sender, newIndex); */
        numClaimers += 1;

        if (numClaimers == gameType){
            manager.markClaimed(this);
        }

        return true;
    }


    function esp() private returns (bool) {
        if (addrToAns[agents[0]] == addrToAns[agents[1]]){
            pendingWithdrawals[agents[0]] = bounty/2;
            pendingWithdrawals[agents[1]] = bounty/2;
            return true;
        }
        return false;
    }

    function majority() private returns (bool) {
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

    function withdraw()
        public
        // afterTime(answerDeadline)
        returns (bool)
    {
        uint amount = pendingWithdrawals[msg.sender];
        if (amount > 0){
            manager.updateStreak(this, msg.sender);
            pendingWithdrawals[msg.sender] = 0;
            if (!msg.sender.send(amount)){
                // No need to call throw here, just reset the amount owing
                pendingWithdrawals[msg.sender] = amount;
                return false;
            }
        }
        return true;
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
        uint amount = pendingWithdrawals[msg.sender];
        if (isPaid){
            manager.updateStreak(this, msg.sender);
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
        settled = true;
        return true;
    }

    function answerJob(int8 answer)
        public
        hasBeenAssigned(this, msg.sender)
        returns (int8)
    {
        /* int8 index = getLabellerIndex(msg.sender); */
        /* SharedStructs.Labeller memory assignee = agents[uint(index)]; */
        /* assignee.answer = answer; */
        /* assignee.completed = true; */
        addrToAns[msg.sender] = answer;
        numAnswered += 1;
        return answer;
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
