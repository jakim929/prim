pragma solidity ^0.4.17;

contract JobManager {

    struct Labeller {
        bool set;
        uint16 streak;
        mapping(uint64 => bool) jobs;
        uint16 latestJob;
    }

    struct Job {
        uint8 gameType;
        string imageLink;
        string query;
        uint bounty;
        uint16 index;
        address[] agents;
        uint8 numClaimers;
        uint8 numAnswered;
        mapping (address => uint8) addrToAns;
        mapping (address => bool) settled;
        mapping (address => uint) amountEarned;
        mapping (address => uint) pendingWithdrawals;
    }

    uint16 public numJobs = 0;
    uint16 private currentJob = 0;
    Job[] private jobs;
    mapping (address => Labeller) labellers;
    address public owner;

    modifier sufficientFunds(uint bounty, uint available) { require(bounty < available); _; }
    modifier notFree(uint bounty) { require(bounty > 0); _;}
    modifier availableJob(Job job) { require(job.numClaimers < job.gameType); _; }
    modifier claimed(Job job) { require(job.numClaimers == job.gameType); _; }
    modifier workLeftFor(address addr) {require(!(labellers[addr].latestJob == numJobs)); _; }
    modifier hasBeenAssigned(Job job, address addr){
        require(labellers[addr].jobs[job.index]);
         _;
    }
    modifier answered(Job job) {require(job.numAnswered == job.gameType); _;}

    constructor() public payable
    {
        owner = msg.sender;
    }


    function claimSpecificJob(uint16 jobIndex, address person)
        public
        returns(bool)
    {
        Job storage job = jobs[jobIndex];

        upsertLabeller(person);
        if(!labellers[person].set){
            return false;
        }
        giveJob(person, jobIndex);
        if(!labellers[person].jobs[job.index]){
            return false;
        }
        return true;
    }

    function answerJob(uint16 jobIndex, uint8 answer)
        private
        hasBeenAssigned(jobs[jobIndex], msg.sender)
        returns (uint8)
    {
        Job storage job = jobs[jobIndex];
        job.addrToAns[msg.sender] = answer;
        job.numAnswered += 1;
        return answer;
    }

    function claimJob(uint16 jobIndex)
        private
        returns (bool)
    {
        Job storage job = jobs[jobIndex];

        if(!(claimSpecificJob(jobIndex, msg.sender))){
            return false;
        }

        job.agents.push(msg.sender);
        job.numClaimers += 1;

        if (job.numClaimers == job.gameType){
            markClaimed(jobIndex);
        }

        return true;
    }

    function claimAnswerJob(uint16 jobIndex, uint8 answer)
        public
        returns(uint8)
    {
        claimJob(jobIndex);
        return answerJob(jobIndex, answer);
    }

    function positiveWithdrawal(uint16 jobIndex, address addr)
        private
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        return (job.pendingWithdrawals[addr] > 0);
    }

    function esp(uint16 jobIndex)
        answered(job)
        private
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));

        if (job.addrToAns[job.agents[0]] == job.addrToAns[job.agents[1]]){
            job.pendingWithdrawals[job.agents[0]] = job.bounty/2;
            job.pendingWithdrawals[job.agents[1]] = job.bounty/2;
        }
        return (job.addrToAns[job.agents[0]] == job.addrToAns[job.agents[1]]);
    }

    function majority(uint16 jobIndex)
        answered(jobs[jobIndex])
        private
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));

        uint8 popularAnswer;
        uint8[2] memory tally;

        uint8 answer;
        for (uint8 i = 0; i < job.gameType; i++){
            answer = uint8(job.addrToAns[job.agents[i]]);
            tally[answer] += 1;
            if (tally[answer] > tally[popularAnswer]){
                popularAnswer = answer;
            }
        }
        if (tally[popularAnswer] < job.gameType - 1){
            return false;
        }
        else {
            uint8 split = tally[popularAnswer];
            for (i = 0; i < job.gameType; i++){
                if (job.addrToAns[job.agents[i]] == popularAnswer){
                    job.pendingWithdrawals[job.agents[i]] = job.bounty / uint(split);
                }
            }
            return (job.addrToAns[msg.sender] == popularAnswer);
        }
    }

    function consensus(uint16 jobIndex)
        answered(jobs[jobIndex])
        private
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));
        return true;
    }

    function settle(uint16 jobIndex)
        answered(jobs[jobIndex])
        public
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));
        bool isPaid;
    	if (job.gameType == 2){
            isPaid = esp(jobIndex);
        }
      	else {
            isPaid = majority(jobIndex);
        }
        /* else if (gameType > 3){
            isPaid = consensus();
        } */

        uint amount = job.pendingWithdrawals[msg.sender];
        if (isPaid){
            updateStreak(jobIndex, msg.sender);
            job.amountEarned[msg.sender] = job.pendingWithdrawals[msg.sender];
            job.pendingWithdrawals[msg.sender] = 0;
            if (!msg.sender.send(amount)){
                // No need to call throw here, just reset the amount owing
                job.pendingWithdrawals[msg.sender] = amount;
                return false;
            }
        }
        else{
            updateStreak(jobIndex, msg.sender);
        }
        job.settled[msg.sender] = true;
        return true;
    }

    function getEarnings(uint16 jobIndex) public returns (uint){
        Job storage job = jobs[jobIndex];
        return job.amountEarned[msg.sender];
    }

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    // function addJob that creates a job and adds it
    function addJob(
        string imageLink,
        string query,
        uint8 gameType,
        uint bounty)
        sufficientFunds(bounty, address(this).balance)
        notFree(bounty)
        public
        returns (uint16)
    {
        jobs.push(Job({
            gameType: gameType,
            imageLink: imageLink,
            query: query,
            bounty: bounty,
            index: numJobs,
            agents: new address[](0),
            numClaimers: 0,
            numAnswered: 0
        }));
        numJobs += 1;
        return numJobs;
    }

    function upsertLabeller(address addr) private {
        if (!(labellers[addr].set)){
            labellers[addr] = Labeller({set: true, streak: 0, latestJob: 0});
        }
    }

    function giveJob(address addr, uint16 jobIndex)
        availableJob(jobs[jobIndex])
        private
    {
        labellers[addr].jobs[jobIndex] = true;
        labellers[addr].latestJob = jobIndex;
    }

    function setCurrentJob(uint16 val) private {
        currentJob = val;
    }

    function markClaimed(uint16 jobIndex)
        claimed(jobs[jobIndex])
        private
    {
        currentJob += 1;
    }

    function getStreak(address addr) public returns (uint16) {
        return labellers[addr].streak;
    }

    function updateStreak(uint16 jobIndex, address addr)
        private
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));

        if (positiveWithdrawal(jobIndex, addr)){
            labellers[addr].streak += 1;
        }
        else{
            labellers[addr].streak = 0;
        }
    }

    function getJob()
        workLeftFor(msg.sender)
        public
        returns (uint16)
    {
        // Returns the sender's address if out of jobs.
        uint16 labellerLatestJob = labellers[msg.sender].latestJob;
        if(labellerLatestJob == numJobs - 1){
            return numJobs;
        }
        uint16 jobSearch = currentJob;
        if(labellerLatestJob > currentJob){
            jobSearch = labellerLatestJob;
        }
        while (labellers[msg.sender].jobs[jobSearch]){
            jobSearch += 1;
        }
        return jobs[jobSearch].index;
    }
}
