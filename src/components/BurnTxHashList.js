import React from 'react';

const BurnTxHashList = (props) => {

  const {burnTxHashList, exit} = props;

  const renderExitButtons = (idNft) => {
    return (
      <div>

        <button onClick={() => {
          exit(idNft);
        }}>
          Exit
        </button>

      </div>
    );
  }

  const renderBurnTxHash = (burnTxHash, index) => {
    console.log({burnTxHash});
    return (
      <tr key={index}>
        <td>{index}</td>
        <td>{burnTxHash.transactionHash}</td>
        <td>
          {renderExitButtons(index)}
        </td>
      </tr>
    );
  }

  const renderBurnTxHashList = () => {
    if (burnTxHashList && burnTxHashList.length > 0) {
      return burnTxHashList.map((burnTxHash, index) => {
        return renderBurnTxHash(burnTxHash, index);
      });
    }
  }

  return (
    <div>
      <h2>Burn Transaction List</h2>
      <table>
        <thead>
        <tr>
          <th style={{borderBottom: "1px solid white"}}>Token ID</th>
          <th style={{borderBottom: "1px solid white", textAlign: "start"}}>Hash</th>
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
