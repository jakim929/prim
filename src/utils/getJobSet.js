let getJobSet = (currentJobManager, setIdx) => {
    return currentJobManager.jobs.call(setIdx)
    .then(ret => {
        var jobSetDetails = {}
        jobSetDetails.gameType = ret[0].toNumber()
        jobSetDetails.imageLink = ret[1].split(',');
        jobSetDetails.baseUrl = ret[2]
        jobSetDetails.query = ret[3].split(',');
        jobSetDetails.bounty = ret[4].toNumber()
        jobSetDetails.index = ret[5].toNumber()
        jobSetDetails.numClaimers = ret[6].toNumber()
        jobSetDetails.numAnswered = ret[7].toNumber()
        return jobSetDetails;
    })
}

export default getJobSet;
