var JobManager = artifacts.require("JobManager.sol");

var manager;

// const jobList = [
//     ["https://tinyurl.com/ya4ukkc3" ,"Is there a hotdog in this image?", 2, Number("1E17")],
//     ["https://tinyurl.com/ljnspby", "Is this a hotdog?", 2, Number("1E17")],
//     ["https://tinyurl.com/ybelqvn5", "Is this Professor Kung?", 2, Number("1E17")],
//     ["https://tinyurl.com/ydgadcfk", "Is this a CS144r TF?", 2, Number("1E17")],
//     ["https://tinyurl.com/y86wsg2r", "Is this a blockchain?", 2, Number("1E17")]
// ];

const batchSize = 8;

imageLinks = ['y8kloxqs', 'ycb3rc3v', 'yafcls94', 'z8ro7er', 'ydcdje4o', 'lx586nw', 'y7k2amnf', 'y9n4uw2b', 'yc2htbk8', 'ycg8jjxp', 'y9wvc7zm', 'y9q3xkbu', 'y8hutv4c', 'ycpmr9me', 'ybhhnket', 'yaq5zwrd', 'yc53pf25', 'y7j7xwzg', 'ydd8t49n', 'y9zccax6', 'y9w32hdn', 'yajm4cxw', 'y9bhxmqe', 'y94qoahl', 'y7e28plm', 'y776u5eu', 'y99qe9gg', 'ydewfhjl', 'ycurjgj8', 'yaxqlunl', 'ybfr474v', 'ydzdlb6h', 'ycab66k2', 'yc3frjda', 'ycuu8y7b', 'yaxtafbo', 'y9goeebb', 'y9uf4los', 'y8t5cjo2', 'hc5lzld', 'ybq6a5jm', 'yb3tlumf', 'y86sobqs', 'yc56dwn8', 'y985gdrl', 'ya2jtslm', 'yb7aro9b', 'y8a9u5do', 'ybe66bg3', 'ya6y2m8z', 'y7p9oe8c', 'yamamx3w', 'ybgp2evx', 'yb9tnro8', 'y97a6nmm', 'y8n5amm9', 'yaporqns', 'yc7pa355', 'y9aoch9z', 'y7d9kk4q', 'ydxg44m8', 'y8ejcm5j', 'y8ppw4t8', 'y7hksfln', 'y9gq6q3d', 'y8t74vg4', 'ya9hxrkg', 'ybhm4gsy', 'yau32m7p', 'y94q2vwr', 'y8uuobq2', 'ybrvlulm', 'y7bkqzju', 'yat7pw2q', 'ycsd49hg', 'y786kpxy', 'yd28fto8', 'y9fuu2ve', 'y8xueqh4', 'ya3gvuzn', 'ycgdxfdu', 'y9q7egp2', 'y6ufvg3u', 'y7b6lnhe', 'y8mpv6bs', 'ya9v5mmw', 'yc5mb6hq', 'y72knnxo', 'y7gbdue8', 'yak7n3gk', 'ybxvdau4', 'y8k722tv', 'ybh7wlpz', 'y7wlx89m'];

let imageLink = "";
let query = "Is this a hot dog?";

for (let i = 0; i < batchSize; i++){
    imageLink += imageLinks[i % imageLinks.length];
    if ( i < batchSize - 1){
        imageLink += ",";
    }
}

const job = [imageLink, query, 2, Number("1E17")];

let jobList = [];
for (let i = 0; i < 5; i++){
    jobList.push(job);
}

module.exports = function(deployer, network, accounts) {
    deployer.deploy(
        JobManager,
        {gas: 7095938, value: 1e18}
    ).then(() => {
        return JobManager.deployed();
    }).then((instance) => {
        manager = instance;
        return manager.addJob(...jobList[0]);
    }).then((ret) => {
        return manager.addJob(...jobList[0]);
    }).then((ret) => {
        return manager.addJob(...jobList[0]);
    }).then(ret => {
        process.exit(0);
    })
}
