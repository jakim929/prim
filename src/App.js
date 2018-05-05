import React, { Component } from 'react';
import Job from './Job';
import Claim from './Claim';

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
import IconButton from 'material-ui/IconButton';

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
      maxWidth : "100%",
      textAlign: "right"
  },
  snackbar:{
      backgroundColor : "#80CBC4"
  }
};



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
            needsToClaimJob: true,
            totalEarnings: 0,
            answers:[]
        }
    }

    componentWillMount() {
        getWeb3
        .then(results => {
            this.setState({
                web3: results.web3
            })
          // Instantiate contract once web3 provided.
            this.instantiateWorkspace()
        })
        .catch(() => {
            console.log('Error finding web3.')
        })
    }


    // Returns promise
    getJobInfo = (currentJobManager, idx) => {
        return currentJobManager.jobs.call(idx)
        .then(ret => {
            var jobDetails = {}
            jobDetails.gameType = ret[0].toNumber()
            jobDetails.imageLink = ret[1]
            jobDetails.query = ret[2]
            jobDetails.bounty = ret[3].toNumber()
            jobDetails.index = ret[4].toNumber()
            jobDetails.numClaimers = ret[5].toNumber()
            jobDetails.numAnswered = ret[6].toNumber()
            return jobDetails;
        })
    }



    //Already have a claimed job to work on?
    checkWorkState(currentJobManager, account) {
        var currentLabeller;
        return currentJobManager.labellers.call(account)
        .then((labeller) => {
            currentLabeller = labeller;
            return currentJobManager.jobStatus.call(currentLabeller[2].toNumber(), account)
        }).then((latestJobStatus) => {
            if(currentLabeller[0]){
                if(latestJobStatus.toNumber() == 1){
                    return currentLabeller[2].toNumber();
                }else{
                    return -1;
                }
            }else{
                return -1;
            }
        })
    }

    instantiateWorkspace = () => {
        // Checks whether to provide interface for claiming job or interface for answering claimed job
        const jobManager = contract(JobManagerContract);
        jobManager.setProvider(this.state.web3.currentProvider);

        this.jobManagerAbstract = jobManager;

        var currentJobManager;
        var account;
        var needsToClaimJob;

        // Check if jobsets have been assigned to this account
        this.state.web3.eth.getAccounts((error, accounts) => {
            jobManager.deployed().then((instance) => {
                currentJobManager = instance;
                console.log("Deployed job manager loaded.")
                return this.checkWorkState(currentJobManager, accounts[0])
            }).then((ret) => {
                needsToClaimJob = ret < 0;
                console.log("Needs to claim job: ", ret < 0)
                this.setState({account: accounts[0], needsToClaimJob, currentJobIndex: ret, currentJobManager})
            }, (err) => {console.log(err, "Failed to instantiate.")}
            )
        })
    }

    closeSnack = () => {
        this.setState({open: false})
    }

    answerJob = (answer) => {
        // console.log("hello", this.state)

        return this.state.currentJobManager.claimAnswerJob(this.state.currentJobIndex, answer, {from:this.state.account, gas:2100000})
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
            if(this.state.currentJobManager){
                return (

                    <div className="App">
                        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>

                        <AppBar position="static" color="default" classes={{colorDefault:"black"}}>
                          <Toolbar>

                            <Typography variant="title">
                              Prim Image Labelling
                            </Typography>

                            <IconButton color="primary" className={classes.button} onClick={() => {this.instantiateWorkspace()}} component="span">
                                    <Icon>refresh_icon</Icon>
                                </IconButton>

                          </Toolbar>
                        </AppBar>

                        <main>
                            <Paper >
                                {
                                    this.state.needsToClaimJob ? (
                                        <Claim currentJobManager={this.state.currentJobManager} account={this.state.account} refresher={this.instantiateWorkspace.bind(this)}/>
                                    ):(
                                        <Job currentJobIndex={this.state.currentJobIndex} currentJobManager={this.state.currentJobManager} account={this.state.account} refresher={this.instantiateWorkspace.bind(this)}/>
                                    )
                                }
                            </Paper>
                        </main>
                    </div>
                );
            }else{
                return (
                    <div className="App">
                        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>

                        <AppBar position="static" color="default" classes={{colorDefault:"black"}}>
                          <Toolbar>
                            <Typography variant="title" className={{flex : 1}}>
                              Prim Image Labelling
                            </Typography>
                          </Toolbar>
                        </AppBar>
                        <main>
                            <Paper >
                                Loading...make sure MetaMask is on the right network!
                            </Paper>
                        </main>
                    </div>
                )
            }
    }
}

export default withStyles(styles)(App);
