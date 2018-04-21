pragma solidity ^0.4.17;

import "./ImageLabel.sol";


contract JobManager {

    struct Labeller {
        bool set;
        uint8 streak;
        mapping(address => uint) jobs;
    }

    uint numJobs = 0;
    uint8 currentJob = 0;

    address[] public jobs;

    mapping (address => Labeller) public labellers;
    address owner;



    modifier sufficientFunds(uint bounty, uint available) { require(bounty < available); _; }
    modifier notFree(uint bounty) { require(bounty > 0); _;}
    modifier availableJob(ImageLabel job) { require(job.availableJob()); _; }
    modifier claimed(ImageLabel job) { require(job.numClaimers() == job.gameType()); _; }
    modifier notSettled(ImageLabel job) {require(!job.settled()); _; }

    function JobManager () public payable
    {
        owner = msg.sender;
    }

    function jobAssigned(ImageLabel job, address addr) public returns (bool) {
        return (labellers[addr].jobs[job] != 0);
    }


    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }


    // function addJob that creates a job and adds it to the mapping
    function addJob(
        string imageLink,
        string query,
        uint claimWindow,
        uint answerWindow,
        uint gameType,
        uint bounty)
        sufficientFunds(bounty, address(this).balance)
        notFree(bounty)
        public
        returns (address)
    {
        ImageLabel newJob = (new ImageLabel).value(bounty)(imageLink, query, claimWindow, answerWindow, gameType, this, numJobs);
        jobs.push(newJob);
        numJobs += 1;

        return newJob;
    }

    function upsertLabeller(address addr) public {
        if (!(labellers[addr].set)){
            labellers[addr] = Labeller({set: true, streak: 0});
        }
    }

    function giveJob(address addr, ImageLabel job)
        availableJob(job)
        public
    {
        labellers[addr].jobs[job] = 1;
    }

    function markClaimed(ImageLabel job)
        claimed(job)
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

    // no longer a need to write a function to delete job since jobs are kept
    // permanently

    function getJob() public returns (address) {
        return jobs[currentJob];
    }

}
