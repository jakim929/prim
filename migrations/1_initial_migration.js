var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
    console.log(accounts[1]);
    console.log(accounts[2]);
    deployer.deploy(Migrations);
};
