import React from 'react';

const KoNftList = (props) => {

  const {chainId, approve, deposit, burn} = props;

  const depositHandle = (tokenId) => {
    deposit(tokenId);
  }

  const approveHandle = (tokenId) => {
    approve(tokenId);
  }

  const burnHandle = (tokenId) => {
    burn(tokenId);
  }

  /**
   * Render one nft
   * @param nft
   * @param index
   * @returns {JSX.Element}
   */
  const renderNft = (idNft, index) => {
    return (
      <tr key={index}>
        <td>{idNft}</td>
        <td>
          {renderNftButtons(idNft)}
        </td>
      </tr>
    );
  }

  const renderNftButtons = (idNft) => {
    if (chainId == 5){
      return(
        <div>
          <button onClick={()=>{approveHandle(idNft)}}>
            Aprouve
          </button>

          <button onClick={()=>{depositHandle(idNft)}}>
            Deposit
          </button>

        </div>
      );
    }else{
      return(
        <div>
          <button onClick={()=>{approveHandle(idNft)}}>
            Aprouve
          </button>

          <button onClick={()=>{depositHandle(idNft)}}>
            Deposit
          </button>

          <button onClick={burnHandle}>Burn</button>
          <button>Exit</button>
        </div>
      );
    }
  }

  const renderNftList = () => {
    const {nftList} = props;
    return nftList.map((nft, index) => {
      return renderNft(nft, index);
    });
  }

  return (
    <table>
      <thead>
      <tr>
        <th style={{borderBottom: "1px solid white"}}>ID</th>
        <th style={{borderBottom: "1px solid white", textAlign: "start"}}>Actions</th>
      </tr>
      </thead>
      <tbody>
        {renderNftList()}
      </tbody>
    </table>
  );
};

export default KoNftList;
