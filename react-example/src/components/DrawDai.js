import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    drawn: state.dai_drawn
  }
}

const DrawDai = ({drawn}) => {

  return (
      <div >
        {drawn? 'Dai Drawn' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(DrawDai);