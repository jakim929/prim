var ImageLabel = artifacts.require("ImageLabel");
var JobManager = artifacts.require("JobManager");

contract("JobManager", accounts => {
    it("Should deploy manager", () => {
        var manager;
        var account_one = accounts[0];
        var account_two = accounts[1];
        return JobManager.deployed().then(instance => {
            manager = instance;
            assert.equal(manager.numJobs, 0);
        })
    })
})


// contract('ImageLabel', (accounts) => {
//     it("Should finish a majority labelling", () => {
//         var job;
//         var account_one = accounts[0];
//         var account_two = accounts[1];
//         var bounty;
//
//         return ImageLabel.deployed().then((instance) => {
//             job = instance;
//             return job.getBalance.call({from: account_one});
//         }).then(ret => {
//             return job.claimJob({from: account_one})
//         }).then(ret => {
//             return job.answerJob(0, {from: account_one})
//         }).then(ret => {
//             return job.claimJob({from: account_two})
//         }).then(ret => {
//             return job.answerJob(0, {from: account_two})
//         }).then(ret => {
//             return job.settle({from: account_one})
//         }).then(ret => {
//             return job.settle({from: account_two})
//         }).then(ret => {
//             return job.getBalance.call();
//         }).then(ret => {
//             assert.equal(ret, 0)
//         })
//     });
// });
