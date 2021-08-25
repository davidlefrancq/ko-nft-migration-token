import React from 'react';

const TransferNft = (props) => {

  const {transfer} = props;

  const onSubmitHandle = (event) => {
    event.preventDefault();
    const form = event.target;

    const tokenId = form.tokenId.value;
    const recipent = form.recipent.value;

    transfer(tokenId, recipent);
  }

  return (
    <form onSubmit={onSubmitHandle}>

      <label>Token Id</label>
      <input id={"tokenId"} name={"tokenId"}/>

      <label>Recipent</label>
      <input id={"recipent"} name={"recipent"}/>

      <button type={"submit"}>Send</button>

    </form>
  );
};

export default TransferNft;
