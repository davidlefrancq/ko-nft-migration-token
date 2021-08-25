import React, {Component} from 'react';
import {ethers} from 'ethers';
import {abi as abiChild} from "../artifacts/contracts/KoChildMintableERC721/KoChildMintableERC721.json";
import {abi as abiRoot} from "../artifacts/contracts/KoMintableERC721/KoMintableERC721.json";
import KoNftList from "./KoNftList";
import MaticJdkManager from "../matic-jdk/MaticJdkManager";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
let from;
signer.getAddress().then((address) => {
  from = address;
});

const INFURA_PROJECT_ID = "2980c008ba994861a926e1ef6b352f10";

const maticProvider = 'https://rpc-mumbai.maticvigil.com/v1/339bfd1060db13f0f39cac79e2cca45b637c93e9';
const ethereumProvider = `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`;

const contractAddress = {
  root: "0x3Ad9a856eDcACFCBF2d4A32194C9e2DbDA4E35Ee",
  child: "0x65061e7c2CDa20Adf3c80Ec61621E0Fca9D1d862",
  childChainManagerProxy: "0xb5505a6d998549090530911180f38aC5130101c6",
};

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
      contractTotalSupply: 0,
      balanceOf: 0,
      nftList: [],
      chainId: 0,
    };

    this.childProvider = new ethers.providers.JsonRpcProvider(maticProvider);
    this.parentProvider = new ethers.providers.JsonRpcProvider(ethereumProvider);
    this.maticJdkManager = new MaticJdkManager();
  }

  componentDidMount() {
    this.refresh();

    // When account change, execute refresh
    window.ethereum.on('accountsChanged', (accounts) => {
      this.refresh();
    });
  }

  /**
   * Burn a token
   * @param tokenId
   */
  burn = (tokenId) => {

    if (parseInt(this.state.chainId) == 5) {
      // Here we are on Goerli Network
      console.log(`Burn Token ${tokenId} in Ethereum Contract`);

      this.maticJdkManager.burnERC721(contractAddress.root, tokenId).then((burnTx) => {
        console.log({burnTx});
      }).catch((error) => {
        console.error(error);
      })

    } else if (parseInt(this.state.chainId) == 80001) {
      // Here we are on Mumbai Network
      console.log(`Burn Token ${tokenId} in Polygon Contract`);

      this.maticJdkManager.burnERC721(contractAddress.child, tokenId).then((burnTx) => {
        console.log({burnTx});
      }).catch((error) => {
        console.error(error);
      })

    }
  }

  /**
   * Deposit for transfer a token Goerli to Mumbai
   * @param tokenId
   */
  deposit = (tokenId) => {

    if (parseInt(this.state.chainId) == 5) {
      // Here we are on Goerli Network
      console.log(`Deposit Token ${tokenId} in Ethereum Contract`);

      this.maticJdkManager.depositERC721ForUser(contractAddress.root, from, tokenId).then((depositTx) => {
        console.log({depositTx});
      }).catch((error) => {
        console.error(error);
      })

    } else if (parseInt(this.state.chainId) == 80001) {
      // Here we are on Mumbai Network
      console.log(`Deposit Token ${tokenId} in Polygon Contract`);

      this.maticJdkManager.depositERC721ForUser(contractAddress.child, from, tokenId).then((depositTx) => {
        console.log({depositTx});
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

    if (parseInt(this.state.chainId) == 5) {
      // Here we are on Goerli Network
      console.log(`Approve Token ${tokenId} in Ethereum Contract`);

      this.maticJdkManager.approveERC721ForDeposit(contractAddress.root, from, tokenId).then((approveTx) => {
        console.log({approveTx});
      }).catch((error) => {
        console.error(error);
      });

    } else if (parseInt(this.state.chainId) == 80001) {
      // Here we are on Mumbai Network
      console.log(`Approve Token ${tokenId} in Polygon Contract`);

      this.maticJdkManager.approveERC721ForDeposit(contractAddress.child, from, tokenId).then((approveTx) => {
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

    this.ethereumOnChainChanged();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.getNetwork().then((network) => {

      console.log("network", network);
      const {chainId} = network;
      this.setChainId(chainId);

      // Instanciate contract
      if (chainId == 5) {

        this.contract = new ethers.Contract(contractAddress.root, abiRoot, this.parentProvider);
        console.log("contract", this.contract);

      } else if (chainId == 80001) {

        this.contract = new ethers.Contract(contractAddress.child, abiChild, this.childProvider);
        console.log("contract", this.contract);
      }

      this.loadTotalSuply();

      this.loadNftList();

    }).catch((error) => {
      console.error(error);
    })
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

    this.getBalanceOf().then(async (balanceOf) => {

      console.log({balanceOf});
      this.setBalanceOf(balanceOf);

      if (balanceOf && balanceOf > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        let nftList = [];
        for (let i = 0; i < balanceOf; i++) {
          const tokenId = await this.contract.connect(signer).tokenOfOwnerByIndex(await signer.getAddress(), i);
          nftList.push(tokenId.toNumber());
        }

        this.setNftList(nftList);
      }else{
        this.setNftList([]);
      }
    });
  }

  setChainId = (chainId) => {
    const state = {...this.state};
    state.chainId = chainId;
    this.setState(state);
  }

  getBalanceOf = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const balanceOf = await this.contract.connect(signer).balanceOf(signer.getAddress());
    return balanceOf.toNumber();
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
    this.sendMintNFT({uriNFT})
  }

  render() {
    return (
      <div>
        <h2>Contract</h2>
        <div>{contractAddress.child}</div>
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
        />

      </div>
    );
  }
}

export default KoNftMigration;
