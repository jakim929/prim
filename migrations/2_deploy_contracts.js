var JobManager = artifacts.require("JobManager.sol");

var manager;

const jobList = [
    ["https://tinyurl.com/ya4ukkc3" ,"Is there a hotdog in this image?", 2, Number("1E17")],
    ["https://tinyurl.com/ljnspby", "Is this a hotdog?", 2, Number("1E17")],
    ["https://tinyurl.com/ybelqvn5", "Is this Professor Kung?", 2, Number("1E17")],
    ["https://tinyurl.com/ydgadcfk", "Is this a CS144r TF?", 2, Number("1E17")],
    ["https://tinyurl.com/y86wsg2r", "Is this a blockchain?", 2, Number("1E17")]
];

// var jobAddresses = [];

module.exports = function(deployer, network, accounts) {
    deployer.deploy(
        JobManager,
        {gas: 5e7, value: 1e18}
    ).then(() => {
        return JobManager.deployed();
    }).then(async (instance) => {
        manager = instance;
        for (let i = 0; i < jobList.length; i++){
            await manager.addJob(...jobList[i]);
        }
        // for (let i = 0; i < jobList.length; i++){
        //     let addr = await manager.jobs.call(i);
        //     jobAddresses.push(addr);
        // }
    })
}
