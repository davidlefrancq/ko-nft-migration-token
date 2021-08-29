import React, {Fragment} from 'react';

const KoNftList = (props) => {

  const {chainId, approve, deposit, burn, exit, burnTxHashList} = props;

  const depositHandle = (tokenId) => {
    deposit(tokenId);
  }

  const approveHandle = (tokenId) => {
    approve(tokenId);
  }

  const burnHandle = (tokenId) => {
    burn(tokenId);
  }

  const exitHandle = (idNft) => {
    exit(idNft);
  }

  /**
   * Render one nft
   * @param nft
   * @param index
   * @returns {JSX.Element}
   */
  const renderNft = (nft, index) => {
    return (
      <Fragment key={index}>
        <tr>
          <td>{nft.id}</td>
          <td>{nft.uri}</td>
          <td>
            {renderNftButtons(nft.id)}
          </td>
        </tr>
      </Fragment>
    );
  }

  const renderNftButtons = (idNft) => {
    if (chainId == 5) {
      return (
        <div>
          <button onClick={() => {
            approveHandle(idNft)
          }}>
            Aprouve
          </button>

          <button onClick={() => {
            depositHandle(idNft)
          }}>
            Deposit
          </button>

        </div>
      );
    } else {
      return (
        <div>

          <button onClick={() => {
            burnHandle(idNft)
          }}>
            Burn
          </button>

          <button onClick={() => {
            exitHandle(idNft)
          }}>
            Exit
          </button>
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
        <th style={{borderBottom: "1px solid white", textAlign: "start"}}>URI</th>
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
