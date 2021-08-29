import React, {Component} from 'react';
import {ethers} from 'ethers';
import {abi as abiChild} from "../artifacts/contracts/KoChildMintableERC721/KoChildMintableERC721.json";
import {abi as abiRoot} from "../artifacts/contracts/KoMintableERC721/KoMintableERC721.json";
import KoNftList from "./KoNftList";
import MaticJdkManager from "../matic-jdk/MaticJdkManager";
import BurnTxHashList from "./BurnTxHashList";
import KoNFT from "../bo/KoNFT";

const {
  INFURA_PROJECT_ID,
  MATIC_VIGIL_APP_ID,
  GOERLI_RPC,
  MUMBAI_RPC,
  ETHEREUM_CONTRACT_ADDRESS,
  SOLIDITY_CONTRACT_ADDRESS,
} = window.env;

const ethereumRPC = `${GOERLI_RPC}${INFURA_PROJECT_ID}`;
const maticRPC = `${MUMBAI_RPC}${MATIC_VIGIL_APP_ID}`;

const uriNFT = "ipfs://QmaQNPLWTSKNXCvzURSi3WrkywJ1qcnYC56Dw1XMrxYZ7Z";

class KoNftMigration extends Component {

  childProvider;
  parentProvider;
  contract;
  childContractChainManagerProxy;
  maticJdkManager

  constructor(props) {
    super(props);

    this.state = {
      signer: null,
      from: null,
      contractTotalSupply: 0,
      balanceOf: 0,
      nftList: [],
      chainId: 0,
      burnTxHashList: [],
    };

    this.childProvider = new ethers.providers.JsonRpcProvider(maticRPC);
    this.parentProvider = new ethers.providers.JsonRpcProvider(ethereumRPC);
    this.maticJdkManager = new MaticJdkManager();
  }

  componentDidMount() {
    this.addEventListenerAccountsChanged()
    this.refresh();
  }

  addEventListenerAccountsChanged() {
    window.ethereum.addListener('accountsChanged', () => {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      signer.getAddress().then((address) => {
        this.setSigner(signer, address);
      }).catch((error)=>{
        console.log(error);
      });
    });
  }

  setSigner = (signer, address) => {
    const state = {...this.state};
    state.signer = signer;
    state.address = address;
    this.setState(state);
    this.refresh();
  }

  exit = (idNft) => {

    const {transactionHash} = this.state.burnTxHashList[idNft];
    console.log("exit", {transactionHash});

    if (transactionHash && transactionHash !== "") {
      if (parseInt(this.state.chainId) === 80001) {
        // Here we are on Mumbai Network
        console.log(`Releases the locked tokens and refunds it to the Users account on Ethereum for txHash : ${transactionHash}`);

        // this.maticJdkManager.exitERC721(transactionHash, from).then((exitTx) => {
        //   console.log({exitTx});
        //   this.refresh();
        // }).catch((error) => {
        //   console.error(error);
        // });
        this.exitERC721(transactionHash, this.state.from);
      }
    }
  }

  exitERC721 = (transactionHash, from) => {
    this.maticJdkManager.exitERC721(transactionHash, from).then((exitTx) => {
      console.log({exitTx});
      this.refresh();
    }).catch((error) => {
      console.error(error);
    })
  }

  /**
   * Burn a token
   * @param tokenId
   */
  burn = (tokenId) => {

    if (parseInt(this.state.chainId) === 80001) {
      // Here we are on Mumbai Network
      console.log(`Burn Token ${tokenId} in Polygon Contract`);

      this.maticJdkManager.burnERC721(SOLIDITY_CONTRACT_ADDRESS, tokenId, this.state.from).then((burnTx) => {
        console.log({burnTx});
        this.addBurnTxHash(tokenId, burnTx);

      }).catch((error) => {
        console.error(error);
      })
    }
  }

  addBurnTxHash = (tokenId, burnTx) => {
    const state = {...this.state};
    state.burnTxHashList[tokenId] = burnTx;
    this.setState(state);
  }

  /**
   * Deposit for transfer a token Goerli to Mumbai
   * @param tokenId
   */
  deposit = (tokenId) => {

    if (parseInt(this.state.chainId) === 5) {
      // Here we are on Goerli Network
      console.log(`Deposit Token ${tokenId} in Ethereum Contract`);

      this.maticJdkManager.depositERC721ForUser(ETHEREUM_CONTRACT_ADDRESS, this.state.from, tokenId).then((depositTx) => {
        console.log({depositTx});
        this.refresh();
      }).catch((error) => {
        console.error(error);
      })
    }
  }

  /**
   * Approve a token for authorize deposit action
   * @param tokenId
   */
  approve = (tokenId) => {

    if (parseInt(this.state.chainId) === 5) {
      // Here we are on Goerli Network
      console.log(`Approve Token ${tokenId} in Ethereum Contract`);

      this.maticJdkManager.approveERC721ForDeposit(ETHEREUM_CONTRACT_ADDRESS, this.state.from, tokenId).then((approveTx) => {
        console.log({approveTx});
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  /**
   * Create a NFT
   * @param uriNFT
   * @returns {Promise<void>}
   */
  sendMintNFT = async ({uriNFT}) => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const resp = await this.contract.connect(signer)["mint(address,string)"](await signer.getAddress(), uriNFT);

    const tx = await resp.wait();
    console.log(tx);

    this.refresh();
  }

  /**
   * Refresh data and execute render if data changed
   */
  refresh = () => {

    if (this.state.signer) {

      this.ethereumOnChainChanged();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.getNetwork().then((network) => {

        console.log("network", network);
        const {chainId} = network;
        this.setChainId(chainId);

        // Instanciate contract
        if (chainId == 5) {

          this.contract = new ethers.Contract(ETHEREUM_CONTRACT_ADDRESS, abiRoot, this.parentProvider);
          console.log("contract", this.contract);

        } else if (chainId == 80001) {

          this.contract = new ethers.Contract(SOLIDITY_CONTRACT_ADDRESS, abiChild, this.childProvider);
          console.log("contract", this.contract);
        }

        this.loadTotalSuply();

        this.loadNftList();

      }).catch((error) => {
        console.error(error);
      })
    }
  }

  ethereumOnChainChanged = () => {
    window.ethereum.on('chainChanged', (chainId) => {
      console.log({chainId});
      this.setChainId(chainId);
      this.refresh();
    });
  }

  loadTotalSuply = () => {
    this.getTotalSuply().then((totalSupply) => {
      this.setContractTotalSupply(totalSupply);
      console.log({totalSupply});
    });
  }

  loadNftList = () => {

    if (this.state.signer) {

      this.getBalanceOf().then(async (balanceOf) => {

        console.log({balanceOf});
        this.setBalanceOf(balanceOf);

        if (balanceOf && balanceOf > 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          let nftList = [];
          for (let i = 0; i < balanceOf; i++) {
            const tokenIdBingInt = await this.contract.connect(this.state.signer).tokenOfOwnerByIndex(await signer.getAddress(), i);
            const tokenId = tokenIdBingInt.toNumber();
            const uri = await this.getTokenUri(tokenId);
            const token = new KoNFT(tokenId, uri);
            nftList.push(token);
          }

          this.setNftList(nftList);
        } else {
          this.setNftList([]);
        }
      });
    }
  }

  setChainId = (chainId) => {
    const state = {...this.state};
    state.chainId = chainId;
    this.setState(state);
  }

  getBalanceOf = async () => {
    let balance = 0;
    if (this.state.signer) {

      const balanceOf = await this.contract.connect(this.state.signer).balanceOf(this.state.signer.getAddress());
      balance = balanceOf.toNumber();
    }
    return balance;
  }

  setBalanceOf = (balanceOf) => {
    const state = {...this.state};
    state.balanceOf = balanceOf;
    this.setState(state);
  }

  getTotalSuply = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const totalSupply = await this.contract.connect(signer).totalSupply();
    return totalSupply.toNumber();
  }

  getTokenUri = async (tokenId) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    return await this.contract.connect(signer).tokenURI(tokenId);
  }

  setContractTotalSupply = (totalSupply) => {
    const state = {...this.state};
    state.contractTotalSupply = totalSupply;
    this.setState(state);
  }

  setNftList = (nftList) => {
    const state = {...this.state};
    state.nftList = nftList;
    this.setState(state);
  }

  handleMint = () => {
    this.sendMintNFT({uriNFT});
  }

  renderBurnTransactionList() {
    const {burnTxHashList} = this.state;
    if (burnTxHashList && burnTxHashList.length > 0) {
      return (
        <BurnTxHashList
          burnTxHashList={this.state.burnTxHashList}
          exit={this.exit}
        />
      );
    }
  }

  render() {

    console.log({burnTxHashList: this.state.burnTxHashList})

    return (
      <div>
        <h2>Contract</h2>
        <div>{SOLIDITY_CONTRACT_ADDRESS}</div>
        <div>{this.state.contractTotalSupply} NFT on Contract</div>

        <h2>NFT Menu</h2>
        You have {this.state.balanceOf} NFT
        <div>
          <button onClick={this.handleMint}>
            Mint Token
          </button>
        </div>

        <div>
          <button onClick={this.refresh}>
            Refresh Token List
          </button>
        </div>

        <h2>Yours NFT</h2>
        <KoNftList
          chainId={this.state.chainId}
          nftList={this.state.nftList}
          approve={this.approve}
          deposit={this.deposit}
          burn={this.burn}
          exit={this.exit}
          burnTxHashList={this.state.burnTxHashList}
        />

        {this.renderBurnTransactionList()}

        <button onClick={() => {
          this.exitERC721("0x7be2856ceea663fcc194d1468d9a6f6d394ad1cc4e25ef4e4aa8c91de89038f6", this.state.from)
        }}>Exit
        </button>

      </div>
    );
  }
}

export default KoNftMigration;
