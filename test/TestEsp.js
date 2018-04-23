var ImageLabel = artifacts.require("ImageLabel.sol");
var JobManager = artifacts.require("JobManager.sol");

contract("JobManager", accounts => {
    it("Should deploy manager", () => {
        var manager;
        var jobCount;

        return JobManager.deployed().then(instance => {
            manager = instance;
            return manager.numJobs.call();
        }).then(ret => {
            jobCount = ret;
            return assert.equal(ret, 5);
        }).then(ret => {
            return manager.currentJob.call();
        }).then(async function(ret){
            let jobIndex = ret;
            let ctr = 0;
            var labellerDict = {};

            while (await manager.currentJob.call() < await manager.numJobs.call()){
                let account = accounts[ctr % 10];
                let availableJob = ImageLabel.at(await manager.getJob.call());
                if (!(availableJob.address in labellerDict)){
                    labellerDict[availableJob.address] = [];
                }
                labellerDict[availableJob.address].push(account);
                await availableJob.claimJob({from: account});
                await availableJob.answerJob(2, {from: account});
                ctr += 1;
            }
            const jobAddrs = Object.keys(labellerDict);
            for (let i = 0; i < jobAddrs.length; i++){
                let jobAddr = jobAddrs[i];
                let job = ImageLabel.at(jobAddr);
                for (let j = 0; j < (await job.gameType.call()); j++){
                    await job.settle({from: labellerDict[jobAddr][j]});
                }
            }
            return;
        }).then(async function(ret){
            return;
        })
    })
})
