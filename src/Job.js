import React, { Component } from 'react';

class Job extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <h1>Is it a hotdog?</h1>
                <br/>
                <img src="https://tinyurl.com/y8kloxqs" width={500} length={500}/>
                <br/>
                <button>Yes</button>
                <button>No</button>
            </div>
        )
    }
}

export default Job;

// <h1>{this.state.query}</h1>
// <img src={this.props.imageLink} />
// <button onClick={this.props.onClick(1)}> Yes </button>
// <button onClick={this.props.onClick(0)} No </button>
