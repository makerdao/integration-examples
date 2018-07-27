import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    created: state.maker_created
  }
}

const CreateMaker = ({created}) => {

  return (
      <div >
        {created? 'Maker Created' : ''}
      </div>
    );
}

export default connect(mapStateToProps)(CreateMaker);