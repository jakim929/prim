import React, { Component } from 'react';
import Job from './Job';

import JobManagerContract from '../build/contracts/JobManager.json'
import ImageLabelContract from '../build/contracts/ImageLabel.json'
const contract = require('truffle-contract');

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const options = {
  contracts: [
    JobManagerContract,
    ImageLabelContract
  ]
}


class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            storageValue: 0,
            web3: null,
            account: null,
            currentJobManager: null,
            currentJobAddress: null,
            currentJobDetails: null,
            totalEarnings: 0

        }
    }

    componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

        getWeb3
        .then(results => {
            this.setState({
                web3: results.web3
            })
          // Instantiate contract once web3 provided.
         this.instantiateContract()
        })
        .catch(() => {
            console.log('Error finding web3.')
        })
    }

    // getAllJobs = () => {
    //     var jobList = [];
    //     const numJobs = this.state.currentJobManager.numJobs.call();
    //     for (let i = 0; i < numJobs; i++){
    //         numJobs.push(this.state.currentJobManager.indexToAddr.call(i));
    //     }
    //     return jobList;
    // }
    // //
    // jobsDone = () => {
    //     var jobList = [];
    //     const allJobs = this.getAllJobs();
    //     for (let i = 0; i < allJobs.length; i++){
    //         let job = allJobs[i];
    //         if (this.state.currentJobManager.jobAssigned.call(job, this.state.account)){
    //             jobList.push(job);
    //         }
    //     }
    //     return jobList;
    // }
    // //
    // settleJobs = () => {
    //     let jobs = this.jobsDone();
    //     let total = 0;
    //     for (let i = 0; i < jobs.length; i++){
    //         let callSettle = true;
    //         let job = this.imageLabelAbstract.at(jobs[i]);
    //         try {
    //             job.settle.call();
    //         }
    //         catch (err){
    //             callSettle = false;
    //         }
    //         if (callSettle) job.settle({from:this.state.account, gas:210000});
    //         total += job.getEarnings.call();
    //     }
    //     this.setState({totalEarnings: total});
    // }
    //

    // Returns promise
    getJobInfo(address) {
        var currentJob = this.imageLabelAbstract.at(address);
        var jobParameters = {};
        const valsToGet = ["gameType", "imageLink", "query", "owner", "bounty", "manager", "index", "numClaimers", "numAnswered"]
        console.log(currentJob)
        var getterCall =  (valueToGet) => {
            return currentJob[valueToGet].call()
        }
        const promiseList = valsToGet.map((val) => getterCall(val))
        return Promise.all(promiseList).then((allVals) =>
        {
            for(var i = 0; i < valsToGet.length; i++){
                jobParameters[valsToGet[i]] = allVals[i]
            }
            return jobParameters
        });
    }

    getNextJob(currentJobManager) {
        return currentJobManager.getJob.call()
    }

    getNextJobInfo() {
        return this.getNextJob(this.state.currentJobManager).then((ret) =>{console.log(ret); return this.getJobInfo(ret, this.imageLabelAbstract)})
    }

    instantiateContract() {
        /*
         * SMART CONTRACT EXAMPLE
         *
         * Normally these functions would be called in the context of a
         * state management library, but for convenience I've placed them here.
         */

        const jobManager = contract(JobManagerContract)
        const imageLabel = contract(ImageLabelContract)
        jobManager.setProvider(this.state.web3.currentProvider)
        imageLabel.setProvider(this.state.web3.currentProvider)

        this.jobManagerAbstract = jobManager
        this.imageLabelAbstract = imageLabel
        var jobManagerInstance;

        this.state.web3.eth.getAccounts((error, accounts) => {
            jobManager.deployed().then((instance) => {
                this.setState({account: accounts[0]})
                console.log(accounts)
                this.setState({currentJobManager: instance})
                console.log(instance)
                return this.getNextJob(instance)
            }).then((ret) => {
                this.setState({currentJobAddress: ret})
                console.log("getjob:",ret)
                return this.getJobInfo(ret)
            }, () => {console.log("failed to find new job")}
            ).then((ret) => {
                this.setState({currentJobDetails: ret})
            })
        })

    }

    answerJob = (answer) =>{
        var currentJob = this.imageLabelAbstract.at(this.state.currentJobAddress);
        currentJob.claimAnswerJob(answer, {from:this.state.account, gas:2100000})
        .then((ret) => {
            console.log("Claiming/Answering Job Transaction", ret)
            this.instantiateContract()
        })
        // .then((ret) => {
        //     console.log("Claiming Job Transaction", ret)
        //     return currentJob.answerJob(answer, {from:this.state.account, gas:210000})
        // }).then((ret) =>{
        //     console.log("Answering Job Transaction", ret)
        //     this.instantiateContract()
        //
        // })

    }



    render() {
        if(this.state.currentJobDetails){
            return (
                <div className="App">
                    <nav className="navbar pure-menu pure-menu-horizontal">
                        <a href="#" className="pure-menu-heading pure-menu-link">Prim Image Labelling</a>
                    </nav>

                    <main className="container">
                        <div className="pure-g">
                            <div className="pure-u-1-1">
                                <h1>{this.state.currentJobDetails.query}</h1>
                                <h1>{this.state.currentJobDetails.index.toNumber()}</h1>

                                <img src={this.state.currentJobDetails.imageLink}/>
                                <button onClick={() => this.answerJob(1)}> Yes </button>
                                <button onClick={() => this.answerJob(0)}> No </button>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }else{
            return (
                <div className="App">
                    No new jobs
                </div>
            )
        }

    }
}




export default App;
