import React, { Component } from 'react'
import JobManagerContract from '../build/contracts/JobManager.json'
import ImageLabelContract from '../build/contracts/ImageLabel.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            storageValue: 0,
            web3: null
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

    getJob() {

  }

    instantiateContract() {
        /*
         * SMART CONTRACT EXAMPLE
         *
         * Normally these functions would be called in the context of a
         * state management library, but for convenience I've placed them here.
         */

        const contract = require('truffle-contract')
        const jobManager = contract(JobManagerContract)
        const imageLabel = contract(ImageLabelContract)
        jobManager.setProvider(this.state.web3.currentProvider)
        imageLabel.setProvider(this.state.web3.currentProvider)

        var jobManagerInstance;
        var job1;

        var jobParameters = {};

        // Get accounts.
        this.state.web3.eth.getAccounts((error, accounts) => {
            jobManager.deployed().then((instance) => {
                jobManagerInstance = instance;

            // Stores a given value, 5 by default.
                return jobManagerInstance.getJob.call({from: accounts[0]});
            }).then((result) => {
            // Get the value from the contract to prove it worked.
            // Update state with the result.
                job1 = imageLabel.at(result);
                return job1.query.call({from:accounts[0]});
            }).then((result) => {
                jobParameters.query = result.toString();
                return job1.imageLink.call({from:accounts[0]});
            }).then((result) => {
                jobParameters.imageLink = result.toString();
                return
            }).then((result) => {
                return this.setState(jobParameters);
            })
        })
    }

    render() {
        return (
        <div className="App">
            <nav className="navbar pure-menu pure-menu-horizontal">
                <a href="#" className="pure-menu-heading pure-menu-link">Prim Image Labelling</a>
            </nav>

            <main className="container">
                <div className="pure-g">
                    <div className="pure-u-1-1">
                        <h1>{this.state.query}</h1>
                        <img src={this.state.imageLink}/>
                    </div>
                </div>
            </main>
        </div>
        );
    }
}

export default App
