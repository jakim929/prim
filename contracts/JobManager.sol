pragma solidity ^0.4.17;

/* import { ImageLabel as IL } from "./ImageLabel.sol"; */


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
        mapping (address => int8) addrToAns;
        mapping (address => bool) settled;
        mapping (address => uint) amountEarned;
        mapping (address => uint) pendingWithdrawals;
    }

    uint16 numJobs = 0;
    uint16 currentJob = 0;
    Job[] jobs;
    mapping (address => Labeller) labellers;
    address public owner;

    modifier sufficientFunds(uint bounty, uint available) { require(bounty < available); _; }
    modifier notFree(uint bounty) { require(bounty > 0); _;}
    modifier availableJob(Job job) { require(job.numClaimers < job.gameType); _; }
    modifier claimed(Job job) { require(job.numClaimers == job.gameType); _; }
    /* modifier notSettled(Job job) {require(!(job.settled[msg.sender])); _; } */
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
        giveJob(person, job);
        if(!labellers[person].jobs[job.index]){
            return false;
        }
        return true;
    }

    function answerJob(Job job, int8 answer)
        public
        hasBeenAssigned(job, msg.sender)
        returns (int8)
    {
        job.addrToAns[msg.sender] = answer;
        job.numAnswered += 1;
        return answer;
    }

    function claimJob(Job job)
        public
        returns (bool)
    {
        if(!(claimSpecificJob(msg.sender, job))){
            return false;
        }

        job.agents.push(msg.sender);
        job.numClaimers += 1;

        if (job.numClaimers == job.gameType){
            markClaimed(job);
        }

        return true;
    }

    function claimAnswerJob(Job job, int8 answer)
        public
        returns(int8)
    {
        claimJob(job);
        return answerJob(job, answer);
    }

    function claimAnswerSettleJob(Job job, int8 answer)
        public
        returns(bool)
    {
        claimAnswerJob(job, answer);
        return settle(job);
    }

    function positiveWithdrawal(Job job, address addr) public returns (bool){
        return (job.pendingWithdrawals[addr] > 0);
    }

    function esp(Job job)
        /* notSettled(job) */
        answered(job)
        private
        returns (bool)
    {
        require(!(job.settled[msg.sender]));

        if (job.addrToAns[job.agents[0]] == job.addrToAns[job.agents[1]]){
            job.pendingWithdrawals[job.agents[0]] = job.bounty/2;
            job.pendingWithdrawals[job.agents[1]] = job.bounty/2;
        }
        return (job.addrToAns[job.agents[0]] == job.addrToAns[job.agents[1]]);
    }

    function majority(Job job)
        /* notSettled(job) */
        answered(job)
        private
        returns (bool)
    {
        require(!(job.settled[msg.sender]));

        int8 popularAnswer;
        mapping (int8 => uint8) ansToVotes;
        for (uint8 i = 0; i < job.gameType; i++){
            int8 answer = job.addrToAns[job.agents[i]];
            ansToVotes[answer] += 1;
            if (ansToVotes[answer] > ansToVotes[popularAnswer]){
                popularAnswer = answer;
            }
        }
        if (ansToVotes[popularAnswer] < job.gameType - 1){
            return false;
        }
        else {
            uint8 split = ansToVotes[popularAnswer];
            for (i = 0; i < job.gameType; i++){
                if (job.addrToAns[job.agents[i]] == popularAnswer){
                    job.pendingWithdrawals[job.agents[i]] = job.bounty / uint(split);
                }
            }
            return (job.addrToAns[msg.sender] == popularAnswer);
        }
    }

    function consensus(Job job)
        /* notSettled(job) */
        answered(job)
        private
        returns (bool)
    {
        require(!(job.settled[msg.sender]));
        return true;
    }

    function settle(Job job)
        /* notSettled(job) */
        answered(job)
        public
        returns (bool)
    {
        require(!(job.settled[msg.sender]));
        bool isPaid;
    	if (job.gameType == 2){
            isPaid = esp(job);
        }
      	else {
            isPaid = majority(job);
        }
        /* else if (gameType > 3){
            isPaid = consensus();
        } */

        uint amount = job.pendingWithdrawals[msg.sender];
        if (isPaid){
            updateStreak(job, msg.sender);
            job.amountEarned[msg.sender] = job.pendingWithdrawals[msg.sender];
            job.pendingWithdrawals[msg.sender] = 0;
            if (!msg.sender.send(amount)){
                // No need to call throw here, just reset the amount owing
                job.pendingWithdrawals[msg.sender] = amount;
                return false;
            }
        }
        else{
            updateStreak(job, msg.sender);
        }
        job.settled[msg.sender] = true;
        return true;
    }

    function getEarnings(Job job) public returns (uint){
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
            index: numJobs
        }));
        numJobs += 1;
        return numJobs;
    }

    function upsertLabeller(address addr) public {
        if (!(labellers[addr].set)){
            labellers[addr] = Labeller({set: true, streak: 0, latestJob: 0});
        }
    }

    function giveJob(address addr, Job job)
        availableJob(job)
        public
    {
        labellers[addr].jobs[job.index] = true;
        labellers[addr].latestJob = job.index;
    }

    function setCurrentJob(uint16 val) public {
        currentJob = val;
    }

    function markClaimed(Job job)
        claimed(job)
        public
    {
        currentJob += 1;
    }

    function getStreak(address addr) returns (uint16) {
        return labellers[addr].streak;
    }

    function updateStreak(Job job, address addr)
        /* notSettled(job) */
        public
    {
        require(!(job.settled[msg.sender]));

        if (job.positiveWithdrawal(addr)){
            labellers[addr].streak += 1;
        }
        else{
            labellers[addr].streak = 0;
        }
    }

    function getJob()
        workLeftFor(msg.sender)
        public
        returns (address)
    {
        // Returns the sender's address if out of jobs.
        uint16 labellerLatestJob = labellers[msg.sender].latestJob;
        if(labellerLatestJob == numJobs - 1){
            return msg.sender;
        }
        uint16 jobSearch = currentJob;
        if(labellerLatestJob > currentJob){
            jobSearch = labellerLatestJob;
        }
        while (labellers[msg.sender].jobs[jobSearch]){
            jobSearch += 1;
        }
        return jobs[jobSearch];
    }
}
