import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

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
        this.state = {change : true}
    }


    render(){
        const { classes } = this.props;
        this.forceUpdate();


        return (
            <Paper className={classes.paper} elevation={4}>

                <h1>{this.props.currentJobDetails.query}</h1>
                {/* <h1>{this.props.currentJobDetails.index.toNumber()}</h1> */}

                <img style={{maxWidth:"80%"}} src={this.props.currentJobDetails.imageLink}/><br/>
                <Grid container spacing={24} >
                    <Grid item xs={6} sm={6}>
                        <Button variant="raised"  size="large" onClick={() => this.props.answerJob(1)}>
                            Yes
                        </Button>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <Button variant="raised"  size="large" onClick={() => this.props.answerJob(0)}>
                            No
                        </Button>
                    </Grid>
                </Grid>

            </Paper>
        )
    }
}

export default withStyles(styles)(Job);

// <h1>{this.state.query}</h1>
// <img src={this.props.imageLink} />
// <button onClick={this.props.onClick(1)}> Yes </button>
// <button onClick={this.props.onClick(0)} No </button>
