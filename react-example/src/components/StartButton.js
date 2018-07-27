import React from 'react';
import { connect } from 'react-redux';
import { startAsync } from '../actions';

const mapStateToProps = state => {
  return {
    started: state.started
  }
}

function mapDispatchToProps(dispatch) {
    return({
        onButtonClick: () => {
        	dispatch(startAsync());
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