import {MaticPOSClient} from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";

const INFURA_PROJECT_ID = "2980c008ba994861a926e1ef6b352f10";

const parentRpc = `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`;
const childRpc = 'https://rpc-mumbai.maticvigil.com/v1/339bfd1060db13f0f39cac79e2cca45b637c93e9';

const privateKey = "91498f38aac05ac896d02a825f33639c60768c9b7e9de9563e143759372c9f45";
const walletAddress = "0x43e6B95803ac909f31C46517691cd2e33e298e40";

class MaticJdkManager {

  maticPOSClient;

  constructor() {
    this.maticPOSClient = new MaticPOSClient({
      network: "testnet",
      version: "mumbai",
      parentProvider: new HDWalletProvider(privateKey, parentRpc),
      maticProvider: new HDWalletProvider(privateKey, childRpc),
      parentDefaultOptions: {from: walletAddress},
      maticDefaultOptions: {from: walletAddress},
    });
  }

  /**
   * Approve Token for deposit
   * @param contractAddress
   * @param from
   * @param tokenId
   * @returns {Promise}
   */
  approveERC721ForDeposit(contractAddress, from, tokenId) {
    return this.maticPOSClient.approveERC721ForDeposit(contractAddress, tokenId, {
      from,
    });
  }

  /**
   * Deposit Token
   * @param contractAddress
   * @param from
   * @param tokenId
   * @returns {Promise}
   */
  depositERC721ForUser(contractAddress, from, tokenId) {
    return this.maticPOSClient.depositERC721ForUser(contractAddress, from, tokenId);
  }

  /**
   * Burn token on TokenChildContract
   * @param contractAddress
   * @param tokenId
   * @returns {Promise}
   */
  burnERC721(contractAddress, tokenId, from) {
    return this.maticPOSClient.burnERC721(contractAddress, tokenId, {from});
  }

  /**
   * Releases the locked tokens and refunds it to the Users account on Ethereum
   * @param burnTxHash
   * @param from
   * @returns {*}
   */
  exitERC721(burnTxHash, from) {
    return this.maticPOSClient.exitERC721(burnTxHash, {from});
  }

}

export default MaticJdkManager;
