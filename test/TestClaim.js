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
            assert.equal(ret, 5);
            return manager.currentJob.call({from: accounts[0]})
        }).then(ret => {
            return manager.getJob.call({from: accounts[0]});
        }).then(ret => {
            console.log("next job for 0: ", ret)
            return manager.claimAnswerJob(0, {from: accounts[0]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[0], {from: accounts[0]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 0 " + ret)
            return manager.getJob.call({from: accounts[0]})
        }).then(ret => {
            console.log("next job for 0: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(0, {from: accounts[0]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[0], {from: accounts[0]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 0 " + ret)
            return manager.getJob.call({from: accounts[0]})
        }).then(ret => {
            console.log("next job for 0: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(0, {from: accounts[0]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[0], {from: accounts[0]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 0 " + ret)
            return manager.getJob.call({from: accounts[0]})
        }).then(ret => {
            console.log("next job for 0: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(0, {from: accounts[0]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[0], {from: accounts[0]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 0 " + ret)
            return manager.getJob.call({from: accounts[0]})
        }).then(ret => {
            console.log("next job for 0: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(0, {from: accounts[0]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[0], {from: accounts[0]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 0 " + ret)
            return manager.getJob.call({from: accounts[0]})
        }).then(ret => {
            if(ret == accounts[0]){
                console.log("out of jobs for 0")
            }
            return manager.getJob.call({from: accounts[1]});
        }).then(ret => {
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            console.log("next job for 1: ", ret)
            return curJob.claimAnswerJob(0, {from: accounts[1]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[1], {from: accounts[1]})

        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 1 " + ret)
            return manager.getJob.call({from: accounts[1]})
        }).then(ret => {
            console.log("next job for 1: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(0, {from: accounts[1]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[1], {from: accounts[1]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 1 " + ret)
            return manager.getJob.call({from: accounts[1]})
        }).then(ret => {
            console.log("next job for 1: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(0, {from: accounts[1]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[1], {from: accounts[1]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 1 " + ret)
            return manager.getJob.call({from: accounts[1]})
        }).then(ret => {
            console.log("next job for 1: ", ret)
            curJob = ImageLabel.at(ret);
            curJobAddress = ret;
            return curJob.claimAnswerJob(1, {from: accounts[1]});
        }).then(ret => {
            return manager.jobAssigned.call(curJobAddress, accounts[1], {from: accounts[1]})
        }).then(ret => {
            console.log("job " + curJobAddress + " claimed by 1 " + ret)
            return manager.getJob.call({from: accounts[1]})
        }).then(ret => {
            console.log("next job for 1: ", ret)
        })
    })
})
