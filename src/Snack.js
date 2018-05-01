import React from 'react';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';

class PositionedSnackbar extends React.Component {
  state = {
    open: false,
    vertical: 'top',
    horizontal: 'center',
  };

  handleClick = state => () => {
    this.setState({ open: true, ...state });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { vertical, horizontal, open } = this.state;
    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={this.props.open}
          onClose={() => {this.props.onClose()}}
          autoHideDuration={50000}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">The other labeller agrees! You win {this.props.amount} ETH, and it has been added to your account.</span>}
        />
      </div>
    );
  }
}

export default PositionedSnackbar;
