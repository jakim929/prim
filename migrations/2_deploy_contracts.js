var JobManager = artifacts.require("JobManager.sol");


var manager;

const batchSize = 8;

function sample(arr){
    let imageLink = "";
    for (let i = 0; i < batchSize; i++){
        imageLink += arr[i % arr.length];
        if ( i < batchSize - 1){
            imageLink += ",";
        }
    }
    return imageLink;
}

const hotdogs = ['y8kloxqs', 'ycb3rc3v', 'yafcls94', 'z8ro7er', 'ydcdje4o', 'lx586nw', 'y7k2amnf', 'y9n4uw2b', 'yc2htbk8', 'ycg8jjxp', 'y9wvc7zm', 'y9q3xkbu', 'y8hutv4c', 'ycpmr9me', 'ybhhnket', 'yaq5zwrd', 'yc53pf25', 'y7j7xwzg', 'ydd8t49n', 'y9zccax6', 'y9w32hdn', 'yajm4cxw', 'y9bhxmqe', 'y94qoahl', 'y7e28plm', 'y776u5eu', 'y99qe9gg', 'ydewfhjl', 'ycurjgj8', 'yaxqlunl', 'ybfr474v', 'ydzdlb6h', 'ycab66k2', 'yc3frjda', 'ycuu8y7b', 'yaxtafbo', 'y9goeebb', 'y9uf4los', 'y8t5cjo2', 'hc5lzld', 'ybq6a5jm', 'yb3tlumf', 'y86sobqs', 'yc56dwn8', 'y985gdrl', 'ya2jtslm', 'yb7aro9b', 'y8a9u5do', 'ybe66bg3', 'ya6y2m8z', 'y7p9oe8c', 'yamamx3w', 'ybgp2evx', 'yb9tnro8', 'y97a6nmm', 'y8n5amm9', 'yaporqns', 'yc7pa355', 'y9aoch9z', 'y7d9kk4q', 'ydxg44m8', 'y8ejcm5j', 'y8ppw4t8', 'y7hksfln', 'y9gq6q3d', 'y8t74vg4', 'ya9hxrkg', 'ybhm4gsy', 'yau32m7p', 'y94q2vwr', 'y8uuobq2', 'ybrvlulm', 'y7bkqzju', 'yat7pw2q', 'ycsd49hg', 'y786kpxy', 'yd28fto8', 'y9fuu2ve', 'y8xueqh4', 'ya3gvuzn', 'ycgdxfdu', 'y9q7egp2', 'y6ufvg3u', 'y7b6lnhe', 'y8mpv6bs', 'ya9v5mmw', 'yc5mb6hq', 'y72knnxo', 'y7gbdue8', 'yak7n3gk', 'ybxvdau4', 'y8k722tv', 'ybh7wlpz', 'y7wlx89m'];

const hamburgers = ['y6upfj5v', 'y8cpusk8', 'y89bp2xc', 'yd23s4nq', 'yaa7mppx', 'ycqhu473', 'yc5vs9jr', 'ydxd8ods', 'yc2hmfwv', 'yctw2uqw', 'y79pjd9h', 'yby7udw5', 'ybv86w83', 'y75g3thm', 'y9lqb7wp', 'ht8fqgo', 'y9zc5ect', 'yajlugdm', 'yb5hcuox', 'y8t2h6fm', 'yckhs75a', 'y92qe5bs', 'ydbz2scf', 'y9d7d7g2', 'yd4pcpqq', 'ycuuy5ky', 'y8m9r3ux', 'ydyb6w6u', 'ybq639wc', 'y7ce4ych', 'ybaoqm8u', 'yddbaqag', 'y9zeqwxw', 'y83ebmjm', 'y6us43ry', 'yd5kmfvp', 'yczyklbg', 'y8n53ryw', 'yd9ys9zl', 'ybzfewkl', 'y7k4pbo8', 'ybfy96xp', 'ybsowde9', 'y9do6k6l', '66qjvaa', 'ychkfq9x', 'yapag3y2', 'yaw5rn7r', 'yb4aju4l', 'y75wu988', 'ycjb26zv', 'yb7opnoh', 'y83sghm5', 'ya6fxlno', 'ycbkdt77', 'y97o4n4s', 'yaq5pq6y', 'y83x6rh6', 'ya5jnvzp', 'y884wyex', 'yavazx2s', 'yc3yfsnh', 'ydb6jhv2', 'ya7aabsn', 'y8wqdvot', 'ybmvwudo', 'ybcmfgk3', 'ybvhuuue', 'y75prs7x', 'yddzd7bo', 'yaqrx29p', 'yc8rfbo2', 'ybs3p4az', 'y867a72r', 'y9l7pgh4', 'y7supq96', 'y78bnvlu', 'yawrywbz', 'y9g3x9ka', 'y76l4zbw', 'y997lmdz', 'y7gulw5k', 'y7a2abvs', 'ya3t5nkl', 'yaf8y38m', 'ycvz8enp', 'ycxmm69s', 'yazm6tsz', 'yawcu492', 'yd746f7f', 'yar84uc8', 'y79l5gtc', 'yd3nxlkj', 'yb3mclxu', 'ycyhvter', 'yaqcs779', 'y83798ze', 'yaavzjgr', 'yavhke43', 'yaecod3n'];

const kung = ['ydhn5nqo', 'y8cgqvu8', 'yapcsgpf', 'y7lgjan3', 'y9fh5e7w', 'ybz3mz9z', 'ya3378s8', 'y9zvb7rs', 'y8vc9d7j', 'ybsd6w36', 'ycbmq9vk', 'ydcwzbwd', 'y8sqd9pm', 'y9jqkuwr', 'y7o2fe5x', 'y85ecum8', 'y8qxep9h', 'y9hxmdgm', 'ybcorubg', 'y6vwslol', 'yd6pextc', 'ycj6c693', 'y9wewy74', 'y9bsu6js', 'ycp6e3at', 'yacaczfm', 'y9ooansd', 'ycquxgkr', 'y8y4udud', 'y7unokah', 'ybtye86u', 'yafadhx2', 'ya3a9mtg', 'y79nhukp', 'ycnymrvf', 'y75e2dsu', 'y7j4pl9e', 'y7tea232', 'yd2u3c7x', 'yaool7lo', 'ybcan29x', 'ycupb5a6', 'y9dalr3g', 'ych6vx5s', 'ycdpp6zw', 'y99tgxgk', 'yb3u24yg', 'yd9upymv', 'ya6yfskj', 'yc7pn9h6', 'ycql5nrh', 'yah69wj6', 'yadp45wa', 'y8b5kyuo', 'ycn6wu7l', 'yb2kkzry', 'yd574msk', 'yabkcujt', 'y825h6bz', 'y7qjj5rs', 'yd6uo35z', 'y7jo7zl3', 'y7uxoweo', 'y8aof6s8', 'ybekocuk', 'ybuuanqy', 'ybh6kgch', 'yczgczda', 'yb6u32zt', 'ybxyofc4', 'y92jwz7c', 'ycgpq53c', 'ybfgy32j', 'y8j3aqan', 'yd5x28rc', 'y7hqzo9u', 'ydbsdty4', 'y88qqch2', 'y9a3zehs', 'ya9mo38n', 'y9swxss6', 'ycwsayuz', 'ybl9xj34', 'y6v2qjrk', 'yd5sbvwb', 'ycwxxbpj', 'yces4ap6', 'yb4we87n', 'ycjwthmx', 'y7a2udv6', 'ycne2b8t', 'ycongtgb', 'ycvzsgn3', 'yd2xya9w', 'yaumupvf', 'y9wrbhhz', 'ydheavxe', 'y9shtxpn', 'yacmpyq3', 'yd9nmkln'];

job0 = [sample(kung), "Is this Professor Kung?", 2, Number("1E17")];
job1 = [sample(hotdogs), "Is this a hotdog?", 2, Number("1E17")];
job2 = [sample(hamburgers), "Is this a hamburger?", 2, Number("1E17")];

module.exports = function(deployer, network, accounts) {
    deployer.deploy(
        JobManager,
        {gas: 7095938, value: 1e18}
    ).then(() => {
        return JobManager.deployed();
    }).then((instance) => {
        manager = instance;
        return manager.addJob(...job0);
    }).then((ret) => {
        return manager.addJob(...job1);
    }).then((ret) => {
        return manager.addJob(...job2);
    }).then(ret => {
        process.exit(0);
    })
}
