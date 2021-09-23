import React, {Component} from 'react';
import KoNftList from "./KoNftList";
import BurnTxHashList from "./BurnTxHashList";
import KoNFT from "../bo/KoNFT";
import Spinner from "./Spinner";
import {VscFileBinary} from "react-icons/all";

const {
  REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_CONTRACT_ADDRESS,
} = process.env;

const uriNFT = "ipfs://QmaQNPLWTSKNXCvzURSi3WrkywJ1qcnYC56Dw1XMrxYZ7Z";


class KoNftMigration extends Component {

  exitProcessed = [];
  nftInLoading = false;

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
      exitProcessedChanged: false,
      refresh: false,
      mintInProgress: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {props} = this;
    if (prevProps.contract !== props.contract) {
      console.log("Reload Gallery data")
      this.init();
    }
  }

  init = () => {
    const state = {...this.state};
    state.nftList = [];
    this.setState(state, () => {
      this.initBurnTxHashList(() => {
        // this.initExitProcessed();
        this.refresh();
      });
    });
  }

  setMintInProgress = (inProgress, callback) => {
    const state = {...this.state};
    state.mintInProgress = inProgress;
    this.setState(state, callback);
  }

  initBurnTxHashList(callback) {
    let burnTxHashList = JSON.parse(localStorage.getItem('burnTxHashList'));
    // let burnTxHashList = localStorage.getItem('burnTxHashList');
    console.log("burnTxHashList", burnTxHashList);
    if (burnTxHashList) {
      const state = {...this.state};
      state.burnTxHashList = burnTxHashList;
      this.setState(state, callback);
    } else {
      this.addBurnTxHash(4, {transactionHash: "0x4d658967255f686c46c278295db5ce0037741e43b5c52948c221df2200fddaac"})
      callback();
    }
  }

  loadAllExitProcessed() {
    this.state.burnTxHashList.map((burnTx, index) => {
      if (burnTx) {
        const {transactionHash} = burnTx;
        this.isERC721ExitProcessed(transactionHash, this.state.from).then((isExitProcessedTx) => {
          this.exitProcessed[index] = isExitProcessedTx;
          this.setExitProcessedAsChanged();
        }).catch((error) => {
          console.error(error);
        });
      }
    });
  }

  initSigner = () => {
    return new Promise((resolve, reject) => {
      try {
        const provider = this.props.provider;
        const signer = provider.getSigner();
        if (signer) {
          signer.getAddress().then((address) => {
            this.setSigner(signer, address);
            resolve();
          }).catch((error) => {
            reject(error);
          });
        } else {
          const error = new Error("Signer not loaded.");
          reject(error);
        }
      } catch (error) {
        reject(error);
      }
      ;
    });
  }

  setSigner = (signer, address) => {
    const state = {...this.state};
    state.signer = signer;
    state.from = address;
    this.setState(state);
    this.refresh();
  }

  isExitProcessed = (idNft) => {

    const {transactionHash} = this.state.burnTxHashList[idNft];
    if (transactionHash && transactionHash !== "") {

      const {chainId, signerAddress} = this.props;

      if (parseInt(chainId) === 80001) {

        this.isERC721ExitProcessed(transactionHash, signerAddress).then((isExitProcessedTx) => {
          this.exitProcessed[idNft] = isExitProcessedTx;
          this.setExitProcessedAsChanged();
          console.log(isExitProcessedTx);
        }).catch((error) => {
          console.error(error);
        });

      } else {
        const error = new Error("Wrong netdwork. Please select Mumbai.")
        console.error(error);
      }

    } else {
      const error = new Error("Transaction Hash does not exist.")
      console.error(error);
    }
  }

  setExitProcessedAsChanged = () => {
    const state = {...this.state};
    state.exitProcessed = !state.exitProcessed;
    this.setState(state);
  }

  isERC721ExitProcessed = (transactionHash, from) => {
    return this.props.maticJdkManager.isERC721ExitProcessed(transactionHash, from);
  }

  exitWithMetadata = (idNft) => {

    const {transactionHash} = this.state.burnTxHashList[idNft];
    if (transactionHash && transactionHash !== "") {

      if (parseInt(this.props.chainId) === 80001) {
        console.log(`Releases the locked tokens and refunds it to the Users account on Ethereum for txHash : ${transactionHash}`);
        console.log({transactionHash});

        const {signerAddress} = this.props;
        this.exitERC721WithMetadata(transactionHash, signerAddress);
      }
    }
  }

  exitERC721WithMetadata = (transactionHash, from) => {
    this.props.maticJdkManager.exitERC721WithMetadata(transactionHash, from).then((exitWithMetadataTx) => {
      console.log({exitWithMetadataTx});
      this.refresh();
    }).catch((error) => {
      console.error(error);
    })
  }

  exit = (idNft) => {

    const {transactionHash} = this.state.burnTxHashList[idNft];
    if (transactionHash && transactionHash !== "") {

      if (parseInt(this.props.chainId) === 80001) {
        console.log(`Releases the locked tokens and refunds it to the Users account on Ethereum for txHash : ${transactionHash}`);
        console.log({transactionHash});

        const {signerAddress} = this.props;
        this.exitERC721(transactionHash, signerAddress);
      }
    }
  }

  exitERC721 = (transactionHash, from) => {
    this.props.maticJdkManager.exitERC721(transactionHash, from).then((exitTx) => {
      console.log({exitTx});
      this.refresh();
    }).catch((error) => {
      console.error(error);
    })
  }

  burnWithMetadata = (tokenId) => {
    if (parseInt(this.props.chainId) === 80001) {
      // Here we are on Mumbai Network
      console.log(`Burn Token with Metadata ${tokenId} in Polygon Contract`);

      const {signerAddress} = this.props;

      this.props.maticJdkManager.burnWithMetadataERC721(REACT_APP_POLYGON_CONTRACT_ADDRESS, tokenId, signerAddress).then((burnTx) => {
        console.log({burnTx});
        this.addBurnTxHash(tokenId, burnTx);

      }).catch((error) => {
        console.error(error);
      })
    }
  }

  /**
   * Burn a token
   * @param tokenId
   */
  burn = (tokenId) => {

    if (parseInt(this.props.chainId) === 80001) {
      // Here we are on Mumbai Network
      console.log(`Burn Token ${tokenId} in Polygon Contract`);

      const {signerAddress} = this.props;

      this.props.maticJdkManager.burnERC721(REACT_APP_POLYGON_CONTRACT_ADDRESS, tokenId, signerAddress).then((burnTx) => {
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
    this.setState(state, this.setLocalStorageBurnTxHash);
  }

  setLocalStorageBurnTxHash = () => {
    localStorage.setItem('burnTxHashList', JSON.stringify(this.state.burnTxHashList));
  }

  /**
   * Deposit for transfer a token Goerli to Mumbai
   * @param tokenId
   */
  deposit = (tokenId) => {

    const {chainId, signerAddress} = this.props;

    if (parseInt(chainId) === 5) {
      // Here we are on Goerli Network
      console.log(`Deposit Token ${tokenId} in Ethereum Contract`);

      this.props.maticJdkManager.depositERC721ForUser(REACT_APP_ETHEREUM_CONTRACT_ADDRESS, signerAddress, tokenId).then((depositTx) => {
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

    const {chainId, signerAddress} = this.props;

    if (parseInt(chainId) === 5) {
      // Here we are on Goerli Network
      console.log(`Approve Token ${tokenId} in Ethereum Contract`);

      this.props.maticJdkManager.approveERC721ForDeposit(REACT_APP_ETHEREUM_CONTRACT_ADDRESS, signerAddress, tokenId).then((approveTx) => {
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

    if (!this.state.mintInProgress) {
      this.setMintInProgress(true);

      const {signer, signerAddress, contract} = this.props;
      const instanceContract = contract.connect(signer);
      // const resp = await instanceContract.mint(signerAddress, uriNFT);
      instanceContract.mint(signerAddress, uriNFT).then((resp) => {
        // const tx = await resp.wait();
        resp.wait().then((tx) => {
          console.log(tx);
          this.setMintInProgress(false, this.refresh);
        }).catch((error) => {
          this.setMintInProgress(false);
          console.error(error);
        });
      }).catch((error) => {
        this.setMintInProgress(false);
        console.error(error);
      });
      // const resp = await this.contract.connect(signer)["mint(address,string)"](await signer.getAddress(), uriNFT);
    }
  }

  /**
   * Refresh data and execute render if data changed
   */
  refresh = () => {

    const {provider} = this.props;
    const signer = provider.getSigner();

    if (signer) {
      provider.getNetwork().then((network) => {
        this.loadNftList();
      }).catch((error) => {
        console.error(error);
      })
    }
  }

  resetStateOnChangeChain(callback) {
    const state = {...this.state};
    state.signer = null;
    state.from = null;
    state.contractTotalSupply = 0;
    state.balanceOf = 0;
    state.nftList = [];
    this.setState(state, callback);
  }

  loadTotalSuply = () => {
    this.getTotalSuply().then((totalSupply) => {
      this.setContractTotalSupply(totalSupply);
      console.log({totalSupply});
    });
  }

  loadNftList = () => {

    const {signer, contract} = this.props;
    if (contract && signer && this.nftInLoading === false) {
      this.nftInLoading = true;

      console.log("Load all user Nft is started.");

      this.getBalanceOf().then(async (balanceOf) => {

        console.log({balanceOf});
        if (balanceOf && balanceOf > 0) {
          this.setBalanceOf(balanceOf);

          let promises = [];
          for (let i = 0; i < balanceOf; i++) {
            promises.push(this.loadNftToken(i));
          }

          Promise.all(promises).then((promisesValues) => {

            promisesValues.sort(function (a, b) {
              return a.id - b.id;
            });

            this.setNftList(promisesValues);
            this.nftInLoading = false;
            this.refreshState();
          }).catch((errors) => {
            this.setNftList([]);
            console.error(errors);
            this.nftInLoading = false;
            this.refreshState();
          });

        } else {
          console.log("error setNftList : invalid balance");
          this.nftInLoading = false;
          this.refreshState();
        }
      });
    }
  }

  refreshState() {
    const state = {...this.state};
    state.refresh = !state.refresh;
    this.setState(state);
  }

  loadNftToken(index) {
    const {signer, signerAddress, contract} = this.props;
    return new Promise((resolve, reject) => {
      contract.connect(signer).tokenOfOwnerByIndex(signerAddress, index).then((tokenIdBingInt) => {

        const tokenId = tokenIdBingInt.toNumber();
        // console.log({tokenId});
        this.getTokenUri(tokenId).then((uri) => {

          // console.log({uri});
          const token = new KoNFT(tokenId, uri);
          console.log({token});
          resolve(token);

        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    });
  }

  getBalanceOf = async () => {
    let balance = 0;
    const {signer, signerAddress, contract} = this.props;
    if (contract && signer) {

      const balanceOf = await contract.connect(signer).balanceOf(signerAddress);
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
    const {signer, contract} = this.props;
    const totalSupply = await contract.connect(signer).totalSupply();
    return totalSupply.toNumber();
  }

  getTokenUri = async (tokenId) => {
    const {signer, contract} = this.props;
    return await contract.connect(signer).tokenURI(tokenId);
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
          exitWithMetadata={this.exitWithMetadata}
          isExitProcessed={this.isExitProcessed}
          exitProcessed={this.exitProcessed}
        />
      );
    }
  }

  renderCententButtonRefresh() {
    if (this.nftInLoading) {
      return (
        <Spinner/>
      );
    } else {
      return "Refresh List";
    }
  }

  renderCententButtonMint() {
    if (this.state.mintInProgress) {
      return (
        <Spinner colorClassName={"text-primary"}/>
      );
    } else {
      return "Mint Token";
    }
  }

  renderMenu() {
    return (
      <div>

        {/* Mint Button */}
        <button className={"btn btn-outline-primary ms-1 me-1"} onClick={this.handleMint}>
          {this.renderCententButtonMint()}
        </button>

        {/* Refresh Button */}
        <button className={"btn btn-outline-secondary ms-1"} onClick={() => {
          this.nftInLoading = false;
          this.loadNftList();
        }}>
          {this.renderCententButtonRefresh()}
        </button>

      </div>
    );
  }

  render() {

    return (
      <div>
        <div>
          <VscFileBinary size={18}/> {this.props.contract.address}
        </div>

        <h2>Menu <span className={"badge bg-secondary m-1"}
                       style={{fontSize: "large"}}>{this.state.balanceOf} NFT</span></h2>
        {this.renderMenu()}

        <KoNftList
          chainId={this.props.chainId}
          nftList={this.state.nftList}
          approve={this.approve}
          deposit={this.deposit}
          burn={this.burn}
          burnWithMetadata={this.burnWithMetadata}
          exit={this.exit}
          exitWithMetadata={this.exitWithMetadata}
        />

        {this.renderBurnTransactionList()}

      </div>
    );
  }
}

export default KoNftMigration;
