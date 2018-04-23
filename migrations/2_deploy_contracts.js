var ImageLabel = artifacts.require("ImageLabel.sol");
var JobManager = artifacts.require("JobManager.sol");

var manager;

const jobList = [
    ["https://tinyurl.com/ya4ukkc3" ,"Is there a hotdog in this image?", 2, 1000000000000000000],
    ["http://images.wisegeek.com/hot-dog-with-mustard.jpg", "Is this a hotdog?", 2, 1000000000000000000],
    ["https://tinyurl.com/ybelqvn5", "Is this Professor Kung?", 2, 1000000000000000000],
    ["https://s3.amazonaws.com/marcuscomiterfiles/img/marcus.jpg", "Is this a CS144r TF?", 2, 1000000000000000000],
    ["https://tinyurl.com/y86wsg2r", "Is this a blockchain?", 2, 1000000000000000000]
];

module.exports = function(deployer, network, accounts) {
    deployer.deploy(
        JobManager,
        {gas: 5000000, value: 10000000000000000000}
    ).then(() => {
        return JobManager.deployed();
    }).then(async function (instance){
        manager = instance;
        for (let i = 0; i < jobList.length; i++){
            await manager.addJob(...jobList[i]);
        }
    })
}
