import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    locked: state.eth_locked
  }
}

const LockEth = ({locked}) => {

  return (
      <div >
        {locked? 'Eth Locked' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(LockEth);