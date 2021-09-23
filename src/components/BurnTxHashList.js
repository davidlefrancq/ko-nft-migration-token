import React from 'react';

const BurnTxHashList = (props) => {

  const {burnTxHashList, exit, exitWithMetadata, isExitProcessed, exitProcessed} = props;

  const renderExitButtons = (idNft) => {
    return (
      <div>

        {/*<button className={"btn btn-outline-danger me-1"} onClick={() => {*/}
        {/*  exit(idNft);*/}
        {/*}}>*/}
        {/*  Exit*/}
        {/*</button>*/}

        <button className={"btn btn-outline-danger ms-1 me-1"} onClick={() => {
          exitWithMetadata(idNft);
        }}>
          Exit Metadata
        </button>

        <button className={"btn btn-outline-primary ms-1"} onClick={() => {
          isExitProcessed(idNft);
        }}>
          Status
        </button>

      </div>
    );
  }

  const renderBurnTxHash = (burnTxHash, index) => {
    return (
      <tr key={index}>
        <td className={"text-center"}>{index}</td>
        <td>{burnTxHash.transactionHash}</td>
        <td>{exitProcessed[index] ? "Finised" : ""}</td>
        <td>
          {renderExitButtons(index)}
        </td>
      </tr>
    );
  }

  const renderBurnTxHashList = () => {
    if (burnTxHashList && burnTxHashList.length > 0) {
      return burnTxHashList.map((burnTxHash, index) => {
        if (burnTxHash) {
          return renderBurnTxHash(burnTxHash, index);
        }
      });
    }
  }

  return (
    <div>
      <h2>Burn Transaction List</h2>
      <table className={"table table-sm"}>
        <thead>
        <tr>
          <th className={"text-center"} style={{borderBottom: "1px solid white"}}>Token ID</th>
          <th style={{borderBottom: "1px solid white", textAlign: "start"}}>Hash</th>
          <th style={{borderBottom: "1px solid white", textAlign: "start"}}>Status</th>
          <th style={{borderBottom: "1px solid white", textAlign: "start"}}>Actions</th>
        </tr>
        </thead>
        <tbody>
        {renderBurnTxHashList()}
        </tbody>
      </table>

    </div>
  );
};

export default BurnTxHashList;
