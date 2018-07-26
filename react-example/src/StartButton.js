import React, { Component } from 'react';
import { connect } from 'react-redux';
import { start } from './actions';

const StartButton = ({ dispatch }) => {

  return (
      <button onClick={()=> {
        dispatch(start());
      }}>
        Start
      </button>
    );
}

export default connect()(StartButton);