import React, { Component } from 'react';
import { connect } from 'react-redux';
import { start } from './actions';

const mapStateToProps = state => {
  return {
    started: state.started
  }
}

function mapDispatchToProps(dispatch, ownProps) {
    return({
        onButtonClick: () => {
        	dispatch(start());
        	ownProps.onButtonClick();
        }
    })
}

const StartButton = ({ started, onButtonClick}) => {

  return (
      <button onClick={onButtonClick}>
        {started ? 'Restart' : 'Start'}
      </button>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(StartButton);