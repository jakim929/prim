pragma solidity ^0.4.17;

import "./ImageLabel.sol";


contract JobManager {

    struct Labeller {
        bool set;
        uint16 streak;
        mapping(address => bool) jobs;
        uint16 latestJob;
    }

    uint16 public numJobs = 0;
    uint16 public currentJob = 0;

    address[] public jobs;

    mapping (address => Labeller) public labellers;
    address public owner;

    modifier sufficientFunds(uint bounty, uint available) { require(bounty < available); _; }
    modifier notFree(uint bounty) { require(bounty > 0); _;}
    modifier availableJob(ImageLabel job) { require(job.availableJob()); _; }
    modifier claimed(ImageLabel job) { require(job.numClaimers() == job.gameType()); _; }
    modifier notSettled(ImageLabel job) {require(!(job.isSettled())); _; }
    modifier workLeftFor(address addr) {require(!(labellers[addr].latestJob == numJobs)); _; }

    constructor() public payable
    {
        owner = msg.sender;
    }

    function indexToAddr(uint16 i) public returns(address){
        return jobs[i];
    }

    function jobAssigned(ImageLabel job, address addr) public returns (bool){
        return labellers[addr].jobs[job];
    }

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    // function addJob that creates a job and adds it to the mapping
    function addJob(
        string imageLink,
        string query,
        uint8 gameType,
        uint bounty)
        sufficientFunds(bounty, address(this).balance)
        notFree(bounty)
        public
        returns (address)
    {
        ImageLabel newJob = (new ImageLabel).value(bounty)(imageLink, query, gameType, this, numJobs);
        jobs.push(newJob);
        numJobs += 1;

        return newJob;
    }

    function upsertLabeller(address addr) public {
        if (!(labellers[addr].set)){
            labellers[addr] = Labeller({set: true, streak: 0, latestJob: 0});
        }
    }

    function giveJob(address addr, ImageLabel job)
        availableJob(job)
        public
    {
        labellers[addr].jobs[job] = true;
        labellers[addr].latestJob = job.index();
        currentJob+=1;
    }

    function markClaimed(ImageLabel job)
        /* claimed(job) */
        public
    {
        currentJob += 1;
    }

    function updateStreak(ImageLabel job, address addr)
        notSettled(job)
        public
    {
        if (job.positiveWithdrawal(addr)){
            labellers[addr].streak += 1;
        }
        else{
            labellers[addr].streak = 0;
        }
    }

    function getJob()
        /* workLeftFor(msg.sender) */
        public
        returns (address)
    {
        return jobs[currentJob];
        /* uint16 jobSearch = labellers[msg.sender].latestJob;
        while(jobAssigned(ImageLabel(jobs[jobSearch]), msg.sender)){
            jobSearch += 1;
        }
        return jobs[jobSearch]; */
    }
}
