pragma solidity ^0.4.17;

contract JobManager {
    uint16 constant batchSize = 256;

    struct Labeller {
        bool set;
        uint16 streak;
        uint16 latestJob;
        mapping(uint256 => uint8) jobs;
        uint amountEarned;
    }

    struct Job {
        uint8 gameType;
        string imageLink;
        string baseUrl;
        string query;
        uint bounty;
        uint16 index;
        address[] agents;
        uint8 numClaimers;
        uint8 numAnswered;
        mapping (address => uint256) addrToAns;
        mapping (address => bool) settled;
        mapping (address => uint) pendingWithdrawals;
    }

    // necessary global variables
    uint16 public numJobs = 0;
    uint16 public currentJob = 0;
    Job[] public jobs;
    mapping (address => Labeller) labellers;
    address public owner;

    modifier sufficientFunds(uint bounty, uint available) { require(bounty < available); _; }
    modifier notFree(uint bounty) { require(bounty > 0); _;}
    modifier availableJob(Job job) { require(job.numClaimers < job.gameType); _; }
    modifier workLeftFor(address addr) {require(!(labellers[addr].latestJob == numJobs)); _; }
    modifier hasBeenAssigned(Job job, address addr){
        require(labellers[addr].jobs[job.index] != 0);
         _;
    }
    modifier answered(Job job) {require(job.numAnswered == job.gameType); _;}

    constructor() public payable {
        owner = msg.sender;
    }


    // Functions for job CRUD

    function jobStatus(uint64 jobSetIndex, address person) view returns(uint8){
        return labellers[person].jobs[jobSetIndex];
    }

    // function addJob that creates a job and adds it to job array
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
            baseUrl: "https://tinyurl.com/",
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

    // function that finds the next eligible job someone can take
    function findJob()
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
        while (labellers[msg.sender].jobs[jobSearch] != 0){
            jobSearch += 1;
        }
        return jobs[jobSearch].index;
    }

    function claimJob(uint16 jobIndex)
        availableJob(jobs[jobIndex])
        public
        returns (bool)
    {
        Job storage job = jobs[jobIndex];

        // upsert labeller (used to be function)
        if (!(labellers[msg.sender].set)){
            labellers[msg.sender] = Labeller({set: true, streak: 0, latestJob: 0, amountEarned: 0});
        }

        labellers[msg.sender].jobs[jobIndex] = 1;
        labellers[msg.sender].latestJob = jobIndex;

        job.agents.push(msg.sender);
        job.numClaimers += 1;

        if (job.numClaimers == job.gameType){
            currentJob += 1;
        }

        return true;
    }

    function answerJob(uint16 jobIndex, uint256 answer)
        public
        hasBeenAssigned(jobs[jobIndex], msg.sender)
        returns (uint256)
    {
        Job storage job = jobs[jobIndex];
        labellers[msg.sender].jobs[jobIndex] = 2;
        job.addrToAns[msg.sender] = answer;
        job.numAnswered += 1;
        return answer;
    }

    // settlement of payment
    function settle(uint16 jobIndex)
        answered(jobs[jobIndex])
        public
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));
        require(job.gameType == 2);
        bool isPaid;
        isPaid = esp(jobIndex);

        uint amount = job.pendingWithdrawals[msg.sender];
        if (isPaid){
            updateStreak(jobIndex, msg.sender);
            labellers[msg.sender].amountEarned += job.pendingWithdrawals[msg.sender];
            job.pendingWithdrawals[msg.sender] = 0;
        }
        else{
            updateStreak(jobIndex, msg.sender);
        }
        job.settled[msg.sender] = true;
        return true;
    }

    function withdraw()
        public
        returns (bool)
    {
        require(labellers[msg.sender].amountEarned > 0);
        if (msg.sender.send(labellers[msg.sender].amountEarned)){
            labellers[msg.sender].amountEarned = 0;
            return true;
        }
        else {
            return false;
        }
    }

    // The Games

    function esp(uint16 jobIndex)
        answered(jobs[jobIndex])
        private
        returns (bool)
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));

        uint32 numCorrect = 0;
        uint256 bitString = job.addrToAns[job.agents[0]] ^ job.addrToAns[job.agents[1]];
        for (uint16 i = 0; i < batchSize; i++){
            if (bitString % 2 == 0){
                numCorrect += 1;
                bitString >> 1;
            }
        }

        job.pendingWithdrawals[job.agents[0]] = job.bounty/batchSize * numCorrect;
        job.pendingWithdrawals[job.agents[1]] = job.bounty/batchSize * numCorrect;

        return (numCorrect > batchSize / 2);
    }
    // Helper functions

    function updateStreak(uint16 jobIndex, address addr) private
    {
        Job storage job = jobs[jobIndex];
        require(!(job.settled[msg.sender]));

        if (job.pendingWithdrawals[addr] > 0){
            labellers[addr].streak += 1;
        }
        else{
            labellers[addr].streak = 0;
        }
    }

    function claimAnswerJob(uint16 jobIndex, uint256 answer)
        public
        returns(uint256)
    {
        claimJob(jobIndex);
        return answerJob(jobIndex, answer);
    }

    // Helpful Getters

    function getStreak(address addr) public returns (uint16){
        return labellers[addr].streak;
    }

    function getNum(uint16 jobIndex) public returns (uint8){
        return jobs[jobIndex].numAnswered;
    }

    function getBalance() public view returns (uint){
        return address(this).balance;
    }
}
