import React, { Component } from 'react';
import Job from './Job';

import JobManagerContract from '../build/contracts/JobManager.json';
import Units from 'ethereumjs-units';

import getWeb3 from './utils/getWeb3';
import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';
import Icon from 'material-ui/Icon';
import PositionedSnackbar from './Snack.js';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const contract = require('truffle-contract');

const styles = {
  paper: {
      paddingTop:"5%",
      paddingBottom:"5%",
      paddingLeft: "10%",
      paddingRight: "10%",
      textAlign: "center"
  },
  button: {
      maxWidth : "100%"
  },
  snackbar:{
      backgroundColor : "#80CBC4"
  }
};

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

    getNextJob(currentJobManager, account) {
        return currentJobManager.getJob.call({from: account})
    }

    getNextJobInfo(currentJobManager) {
        return this.getNextJob(currentJobManager).then((ret) =>{console.log(ret); return this.getJobInfo(ret, this.imageLabelAbstract)})
    }

    instantiateContract = () => {
        /*
         * SMART CONTRACT EXAMPLE
         *
         * Normally these functions would be called in the context of a
         * state management library, but for convenience I've placed them here.
         */

        const jobManager = contract(JobManagerContract);
        jobManager.setProvider(this.state.web3.currentProvider);

        this.jobManagerAbstract = jobManager;

        var currentJobManager;
        var currentJobAddress;
        var currentJobDetails;
        var account;

        this.state.web3.eth.getAccounts((error, accounts) => {
            jobManager.deployed().then((instance) => {
                console.log(accounts)
                currentJobManager = instance;
                // this.setState({currentJobManager: instance})
                console.log(instance)
                return this.getNextJob(instance, accounts[0])
            }).then((ret) => {
                currentJobAddress = ret;
                // this.setState({currentJobAddress: ret})
                console.log("getjob:",ret)
                return this.getJobInfo(ret)
            }, () => {console.log("failed to find new job")}
            ).then((ret) => {
                currentJobDetails = ret;
                this.setState({account: accounts[0], currentJobManager, currentJobAddress, currentJobDetails})
                // this.setState({currentJobDetails: ret})
            })
        })

    }

    closeSnack = () => {
        console.log("DSAFASFSADFDSA")
        this.setState({open: false})
    }

    answerJob = (answer) => {
        var currentJob = this.imageLabelAbstract.at(this.state.currentJobAddress);
        console.log("hello", this.state)

        return currentJob.claimAnswerJob(answer, {from:this.state.account, gas:2100000})
        .then((ret) => {
            console.log("Claiming/Answering Job Transaction", ret)
            this.instantiateContract();
            this.forceUpdate();
        })

    }



    refresh = () => {
        this.instantiateContract()
        this.forceUpdate()
    }


    render() {
        const { classes } = this.props;

        if(this.state.currentJobDetails){
            return (

                <div className="App">
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>

                    <AppBar position="static" color="default" classes={{colorDefault:"black"}}>
                      <Toolbar>
                        <Typography variant="title">
                          Prim Image Labelling
                        </Typography>
                      </Toolbar>
                    </AppBar>

                    <main>
                        <Grid container spacing={24}>
                            <Grid item xs={6}>
                                <PositionedSnackbar className={classes.snackbar} open={this.state.open} onClose={this.closeSnack.bind(this)} amount={Units.convert(this.state.amountEarned?this.state.amountEarned:'0','wei', 'eth')}/>
                            </Grid>
                        </Grid>
                        <Grid container spacing={24}>
                            <Grid item xs={12} sm={12}>
                                {/* <button onClick={() => this.answerJob(1)}>Hack </button> */}
                                {/* {this.state.currentJobDetails.index.toNumber()} */}
                                <Paper className={classes.paper} elevation={4}>

                                    <h1>{this.state.currentJobDetails.query}</h1>
                                    {/* <h1>{this.props.currentJobDetails.index.toNumber()}</h1> */}
                                    <h4>Reward Pool: {Units.convert(this.state.currentJobDetails.bounty.toString(), 'wei', 'eth')} ETH</h4>
                                    <img style={{maxWidth:"60%"}} src={this.state.currentJobDetails.imageLink}/><br/>
                                    <Grid container spacing={24} >
                                        <Grid item xs={6} sm={6}>
                                            <Button variant="raised"  size="large" onClick={() => this.answerJob(1)}>
                                                Yes
                                            </Button>
                                        </Grid>
                                        <Grid item xs={6} sm={6}>
                                            <Button variant="raised"  size="large" onClick={() => this.answerJob(0)}>
                                                No
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <Button variant="fab" color="primary" aria-label="r" onClick={this.refresh.bind(this)} className={classes.button}>
                                        <Icon>refresh_icon</Icon>
                                    </Button>

                                </Paper>
                            </Grid>
                        </Grid>

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

export default withStyles(styles)(App);
