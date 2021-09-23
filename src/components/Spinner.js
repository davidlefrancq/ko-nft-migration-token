import React from 'react';

const Spinner = (props) => {

  const {colorClassName} = props;

  return (
    <div className={`spinner-grow ${colorClassName}`} style={{width: 18, height: 18}} role={"status"}>
      <span className={"visually-hidden"}>Loading...</span>
    </div>
  );
};

export default Spinner;
