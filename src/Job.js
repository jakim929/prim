import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

import getJobSet from './utils/getJobSet';
import { CircularProgress } from 'material-ui/Progress';


import Units from 'ethereumjs-units';
import Icon from 'material-ui/Icon';


import { withStyles } from 'material-ui/styles';

const styles = {
  paper: {
      padding: "10%",
      textAlign: "center"
  },
  button: {
      maxWidth : "100%"
  }
};

class Job extends Component {
    constructor(props){
        super(props);
        this.state = {
            change : true,
            answers: "",
            currentTaskIndex: 0,
            jobSet: null,
            completed: false,
            imageLoaded: false
        }
    }

    componentDidMount(){
        console.log(this.props.currentJobManager)
        this._loadNextJobInfo(this.props.currentJobManager, this.props.account)
    }

    componentWillReceiveProps(nextProps) {
        this._loadNextJobInfo(nextProps.currentJobManager, nextProps.account)
    }

    _loadNextJobInfo(currentJobManager, account) {
        getJobSet(currentJobManager, this.props.currentJobIndex)
        .then((ret) => this.setState({jobSet: ret}))
    }

    answerJob = (answer) => {
        if(this.state.imageLoaded){
            this.setState((prevState, props) => {
                var currentAnswer =  prevState.answers + answer.toString()
                console.log( currentAnswer.length , this.state.jobSet.imageLink.length)
                return {
                    currentTaskIndex : prevState.currentTaskIndex + 1,
                    answers: currentAnswer,
                    completed: currentAnswer.length === this.state.jobSet.imageLink.length,
                    imageLoaded: false
                }
            }, () => {console.log(this.state.answers)})
        }else{
            console.log("image not loaded yet.")
        }


    }

    submitAnswerSet() {
        const intAnswerSet = parseInt(this.state.answers, 2)
        console.log(typeof intAnswerSet)
        console.log(this.props.account)
        this.props.currentJobManager.answerJob(this.state.jobSet.index ,intAnswerSet, {from: this.props.account}).then((tx) => {
            console.log(tx)
            // this.props.refresher();
        }).catch((err) => {console.log(err)})
    }

    imageLoadedCompletely = () => {
        this.setState({imageLoaded: true})
    }

    render(){
        const { classes } = this.props;

        if(this.state.jobSet){
            var jobCount = this.state.jobSet.imageLink.length;

            return (
                <div>
                    <Grid container spacing={24}>
                        <Grid item xs={12} sm={12}>

                            <Paper className={classes.paper} elevation={0}>
                                {
                                    !this.state.completed?(
                                        <div>
                                            <h1>{this.state.jobSet.query[0]}</h1>
                                            <h4>Reward Pool: {Units.convert(this.state.jobSet.bounty/jobCount, 'wei', 'eth')} ETH</h4>
                                            <img style={{maxWidth:"60%", height: "300px"}} onLoad={() => {this.imageLoadedCompletely()}} src={this.state.jobSet.baseUrl + this.state.jobSet.imageLink[this.state.currentTaskIndex]}/><br/>
                                            <Grid container spacing={24} >
                                                <Grid item xs={6} sm={6}>
                                                    <Button variant="raised" disabled={!this.state.imageLoaded}  size="large" onClick={() => this.answerJob(1)}>
                                                        Yes
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={6} sm={6}>
                                                    <Button variant="raised" disabled={!this.state.imageLoaded} size="large" onClick={() => this.answerJob(0)}>
                                                        No
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    ):(
                                        <div>
                                            <h1>You completed all the task in this set!</h1>
                                            <Button variant="raised" disabled={!this.state.completed} size="large" onClick={() => this.submitAnswerSet()}>
                                                Submit Answers!
                                            </Button>

                                        </div>


                                    )
                                }




                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            )
        }else{
            return (
                <div>

                    <CircularProgress className={classes.progress} size={50} />
                    <br/>
                    <br/>
                    <h2>Loading task...</h2>


                </div>
            )

        }

    }
}

export default withStyles(styles)(Job);

// <h1>{this.state.query}</h1>
// <img src={this.props.imageLink} />
// <button onClick={this.props.onClick(1)}> Yes </button>
// <button onClick={this.props.onClick(0)} No </button>
