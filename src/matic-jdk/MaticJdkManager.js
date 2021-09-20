import {MaticPOSClient} from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";

const {
  REACT_APP_WALLET_PRIVATE_KEY,
  REACT_APP_WALLET_ADDRESS,
  REACT_APP_INFURA_PROJECT_ID,
  REACT_APP_MATIC_VIGIL_APP_ID,
  REACT_APP_GOERLI_RPC,
  REACT_APP_MUMBAI_RPC,
} = process.env;

console.log("env",process.env);

const parentRpc = `${REACT_APP_GOERLI_RPC}${REACT_APP_INFURA_PROJECT_ID}`;
const childRpc = `${REACT_APP_MUMBAI_RPC}${REACT_APP_MATIC_VIGIL_APP_ID}`;

const privateKey = REACT_APP_WALLET_PRIVATE_KEY;
const walletAddress = REACT_APP_WALLET_ADDRESS;

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
    console.log({contractAddress, tokenId, from});
    return this.maticPOSClient.burnERC721(contractAddress, tokenId, {from});
  }

  /**
   * Releases the locked tokens and refunds it to the Users account on Ethereum
   * @param burnTxHash
   * @param from
   * @returns {*}
   */
  exitERC721(burnTxHash, from) {
    return this.maticPOSClient.exitERC721WithMetadata(burnTxHash, {from});
  }

}

export default MaticJdkManager;
