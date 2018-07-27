import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    opened: state.cdp_opened
  }
}

const OpenCdp = ({opened}) => {

  return (
      <div >
        {opened? 'CDP Opened' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(OpenCdp);