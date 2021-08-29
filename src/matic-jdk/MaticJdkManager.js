import {MaticPOSClient} from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";

const {
  WALLET_PRIVATE_KEY,
  WALLET_ADDRESS,
  INFURA_PROJECT_ID,
  MATIC_VIGIL_APP_ID,
  GOERLI_RPC,
  MUMBAI_RPC,
} = window.env;

const parentRpc = `${GOERLI_RPC}${INFURA_PROJECT_ID}`;
const childRpc = `${MUMBAI_RPC}${MATIC_VIGIL_APP_ID}`;

const privateKey = WALLET_PRIVATE_KEY;
const walletAddress = WALLET_ADDRESS;

console.log(process.env);
console.log({parentRpc});
console.log({childRpc});
console.log({privateKey});
console.log({walletAddress});

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
