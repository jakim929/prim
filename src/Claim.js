import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

import getJobSet from './utils/getJobSet';

import Units from 'ethereumjs-units';
import { CircularProgress } from 'material-ui/Progress';
import Icon from 'material-ui/Icon';

import Divider from 'material-ui/Divider';


import { withStyles } from 'material-ui/styles';

const styles = {
  paper: {
      padding: "7%",
      textAlign: "center"
  },
  button: {
      maxWidth : "100%"
  }
};

class Claim extends Component {
    constructor(props){
        super(props);
        this.state = {
            nextJobSet: null,
            noMore : false,
            waitingBlock: false
        }
    }

    componentDidMount(){
        console.log(this.props.currentJobManager)
        this._loadNextJobInfo(this.props.currentJobManager, this.props.account)
    }

    componentWillReceiveProps(nextProps) {
        this._loadNextJobInfo(nextProps.currentJobManager, nextProps.account)
    }

    getNextJobSet(currentJobManager, account) {
        return currentJobManager.findJob.call({from: account})
    }

    getNextJobInfo(currentJobManager, account) {
        return this.getNextJobSet(currentJobManager, account)
        .then((ret) => getJobSet(currentJobManager, ret))
    }

    _loadNextJobInfo(currentJobManager, account) {
        this.getNextJobInfo(currentJobManager, account)
        .then((ret) => this.setState({nextJobSet: ret}))
        .catch((err) => {this.setState({noMore : true})})
    }

    delay(t, v) {
       return new Promise(function(resolve) {
           setTimeout(resolve.bind(null, v), t)
       });
    }

    claimJob = (setIdx) => {
        return this.props.currentJobManager.claimJob(setIdx, {from: this.props.account})
        .then(() => {
            this.setState({waitingBlock: true})
            return this.delay(15000)
        }).then(() => {
            console.log("hellosky")
            this.setState({waitingBlock: false})
            this.props.refresher()
        })
    }


    render(){
        const { classes } = this.props;
        console.log(this.state.nextJobSet)
        return (
            <Paper className={classes.paper} elevation={4}>
                {
                    this.state.nextJobSet? (

                        <div>
                            {this.state.waitingBlock?(<div></div>):(
                                <div>
                                    <h2>Next Batch of Tasks</h2>
                                    <Divider />
                                    <br/>

                                    <h3>Task Count: {this.state.nextJobSet.imageLink.length}</h3>
                                    <h3>Total Bounty: {Units.convert(this.state.nextJobSet.bounty.toString(), 'wei', 'eth')} ETH</h3>

                                    <h3>Bounty/Task: {Units.convert(this.state.nextJobSet.bounty/this.state.nextJobSet.imageLink.length, 'wei', 'eth')} ETH</h3>
                                    <br/>

                                    <br/>
                                    Examples:
                                    <br/>
                                    <Grid container spacing={16}>
                                        <Grid item xs={12} sm={4}>
                                            <h5>{this.state.nextJobSet.query[0]}</h5>
                                            <img style={{maxHeight:"120px", border:"1px solid black"}} src={this.state.nextJobSet.baseUrl + this.state.nextJobSet.imageLink[0]}/>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <h5>{this.state.nextJobSet.query[0]}</h5>
                                            <img style={{maxHeight:"120px", border:"1px solid black"}} src={this.state.nextJobSet.baseUrl + this.state.nextJobSet.imageLink[1]}/>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <h5>{this.state.nextJobSet.query[0]}</h5>
                                            <img style={{maxHeight:"120px", border:"1px solid black"}} src={this.state.nextJobSet.baseUrl + this.state.nextJobSet.imageLink[2]}/>
                                        </Grid>
                                    </Grid>

                                </div>
                            )}


                            <br/>
                            <br/>
                            <Grid container spacing={24} >
                                <Grid item xs={12} sm={12}>

                                    {this.state.waitingBlock? (
                                        <div>
                                            <CircularProgress className={classes.progress} size={50} />
                                            <br/>
                                            <h2>Waiting for the block to update! If it doesn't automatically refresh, press the refresh button on the toolbar above to get the newest state!</h2>

                                        </div>


                                    ):(
                                        <Button variant="raised"  size="large" onClick={() => this.claimJob(this.state.nextJobSet.index)}>
                                            Claim
                                        </Button>
                                    )}

                                </Grid>
                            </Grid>
                        </div>
                    ):(
                        this.state.noMore?(
                            <div>
                                <Icon color="primary" style={{ fontSize: 36 }}>check_circle</Icon>
                                <br/>
                                <h2>You've done all the jobs. Check back later!</h2>

                            </div>
                        ):(
                            <div>
                                <CircularProgress className={classes.progress} size={50} />
                                <br/>

                                Loading next set of jobs to claim...

                            </div>

                        )
                    )
                }

            </Paper>
        )
    }
}

export default withStyles(styles)(Claim);

// <h1>{this.state.query}</h1>
// <img src={this.props.imageLink} />
// <button onClick={this.props.onClick(1)}> Yes </button>
// <button onClick={this.props.onClick(0)} No </button>
