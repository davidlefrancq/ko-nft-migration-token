import React, {Fragment} from 'react';
import ImageIpsf from "./ImageIPSF";

const KoNftList = (props) => {

  const {chainId, approve, deposit, burn, burnWithMetadata, exit} = props;

  const depositHandle = (tokenId) => {
    deposit(tokenId);
  }

  const approveHandle = (tokenId) => {
    approve(tokenId);
  }

  const burnHandle = (tokenId) => {
    burn(tokenId);
  }

  const burnWithMetadataHandle = (tokenId) => {
    burnWithMetadata(tokenId);
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
          <td className={"text-center"}>
            <ImageIpsf uri={nft.uri} size={35}/>
          </td>
          <td>
            {nft.id}
          </td>
          <td>
            {nft.uri}
          </td>
          <td>
            {renderNftButtons(nft.id)}
          </td>
        </tr>
      </Fragment>
    );
  }

  const renderNftButtons = (idNft) => {
    if (chainId === 5) {
      return (
        <div>
          <button className={"btn btn-outline-primary me-1"} onClick={() => {
            approveHandle(idNft)
          }}>
            Aprouve
          </button>

          <button className={"btn btn-outline-danger ms-1"} onClick={() => {
            depositHandle(idNft)
          }}>
            Deposit
          </button>

        </div>
      );
    } else {
      return (
        <div>

          {/*<button className={"btn btn-outline-danger me-1"} onClick={() => {*/}
          {/*  burnHandle(idNft)*/}
          {/*}}>*/}
          {/*  Burn*/}
          {/*</button>*/}

          <button className={"btn btn-outline-danger ms-1"} onClick={() => {
            burnWithMetadataHandle(idNft)
          }}>
            Burn with Metadata
          </button>

          {/*<button onClick={() => {*/}
          {/*  exitHandle(idNft)*/}
          {/*}}>*/}
          {/*  Exit*/}
          {/*</button>*/}
        </div>
      );
    }
  }

  const renderNftList = () => {
    const {nftList} = props;
    if (nftList && nftList !== "") {
      return nftList.map((nft, index) => {
        return renderNft(nft, index);
      });
    }
  }

  return (
    <table className={"table table-sm"}>
      <thead>
      <tr>
        <th className={"text-center"} style={{borderBottom: "1px solid white"}}>Image</th>
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
