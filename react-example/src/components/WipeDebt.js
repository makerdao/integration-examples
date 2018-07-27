import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    wiped: state.dai_wiped
  }
}

const WipeDebt = ({wiped}) => {

  return (
      <div >
        {wiped? 'Debt Wiped' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(WipeDebt);