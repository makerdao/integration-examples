import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    shut: state.cdp_shut
  }
}

const ShutCdp = ({shut}) => {

  return (
      <div >
        {shut? 'CDP Shut' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(ShutCdp);