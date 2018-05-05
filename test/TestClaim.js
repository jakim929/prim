var JobManager = artifacts.require("JobManager.sol");

contract("JobManager", accounts => {
    it("Should test claimJob", () => {
        var manager;
        var jobCount;
        var curJob;
        var curJobAddress;
        return JobManager.deployed().then(instance => {
            manager = instance;
            return manager.numJobs.call();
        }).then(ret => {
            jobCount = ret;
            assert.equal(ret, 3);
            return manager.currentJob.call({from: accounts[0]})
        }).then(ret => {
            return manager.findJob.call({from: accounts[0]});
        }).then(ret => {
            return manager.claimAnswerJob(ret, 0, {from: accounts[0]});
        }).then(ret => {
            return manager.getNum.call(0);
        }).then(ret => {
            console.log(Number(ret));
        }).then(ret => {
            return manager.findJob.call({from: accounts[0]});
        }).then(ret => {
            console.log("should be 1: ", Number(ret));
            return manager.findJob.call({from: accounts[1]});
        }).then(ret => {
            console.log("should be 0: ", Number(ret));
            return manager.claimAnswerJob(ret, 0, {from: accounts[1]});
        }).then(ret => {
            return manager.getNum.call(0);
        }).then(ret => {
            assert.equal(ret, 2);
        }).then(async (ret) => {
            await manager.settle(0, {from: accounts[0]});
            await manager.settle(0, {from: accounts[1]});
            await manager.withdraw({from: accounts[0]});
            await manager.withdraw({from: accounts[1]});
        })
    })
})
