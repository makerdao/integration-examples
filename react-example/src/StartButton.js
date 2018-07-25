import React, { Component } from 'react';

class StartButton extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onButtonClick();
  }

  render(){
  	return (
      <button onClick={this.handleClick}>
        {this.props.started ? 'Restart' : 'Start'}
      </button>
  	);
  }
}

export default StartButton;