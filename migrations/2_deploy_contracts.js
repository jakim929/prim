var ImageLabel = artifacts.require("ImageLabel");
var JobManager = artifacts.require("JobManager");

var jm;

module.exports = function(deployer, network, accounts) {
    deployer.deploy(
        JobManager,
        {gas: 5000000, value: 800000000000}
    ).then(() => {
        return JobManager.deployed()
    }).then((instance) => {
        jm = instance;
        return jm.addJob("https://tinyurl.com/ya4ukkc3" ,"Is there a hotdog in this image?", 1212312321, 123123123, 2, 999990998)
    })
}
