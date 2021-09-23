import './App.css';
import ConnectWeb3 from "./components/ConnectWeb3";
import KoNftMigration from "./components/KoNftMigration";
import MaticJdkManager from "./matic-jdk/MaticJdkManager";
import {ethers} from "ethers";
import {abi as abiRoot} from "./artifacts/contracts/KoMintableERC721/KoMintableERC721.json";
import {abi as abiChild} from "./artifacts/contracts/KoChildMintableERC721/KoChildMintableERC721.json";
import {useEffect, useState} from "react";

const maticJdkManager = new MaticJdkManager();

const {
  REACT_APP_INFURA_PROJECT_ID,
  REACT_APP_MATIC_VIGIL_APP_ID,
  REACT_APP_GOERLI_RPC,
  REACT_APP_MUMBAI_RPC,
  REACT_APP_ETHEREUM_CONTRACT_ADDRESS,
  REACT_APP_POLYGON_CONTRACT_ADDRESS,

} = process.env;

const ethereumRPC = `${REACT_APP_GOERLI_RPC}${REACT_APP_INFURA_PROJECT_ID}`;
const maticRPC = `${REACT_APP_MUMBAI_RPC}${REACT_APP_MATIC_VIGIL_APP_ID}`;

const childProvider = new ethers.providers.JsonRpcProvider(maticRPC);
const parentProvider = new ethers.providers.JsonRpcProvider(ethereumRPC);


function App() {

  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signerAddress, setSignerAddress] = useState(null);
  const [chainId, setChainId] = useState(0);

  useEffect(() => {
    init();
    initEventOnChainChanged();
  }, []);

  const init = () => {
    initContract();
    initReloadOnChainChanged();
  }

  const initEventOnChainChanged = () => {
    window.ethereum.on('chainChanged', (newChainId) => {
      if (parseInt(newChainId) !== chainId) {
        init();
      }
    });
  }

  const initContract = () => {
    const curentProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(curentProvider);

    const curentSigner = curentProvider.getSigner();
    setSigner(curentSigner);

    curentSigner.getAddress().then((curentSignerAddress) => {
      setSignerAddress(curentSignerAddress);
    }).catch((error) => {
      console.error(error);
    });

    curentProvider.getNetwork().then((network) => {
      const {chainId} = network;
      setChainId(chainId);
      try {
        if (chainId === 5) {
          const contractGoerli = new ethers.Contract(REACT_APP_ETHEREUM_CONTRACT_ADDRESS, abiRoot, parentProvider);
          setContract(contractGoerli);
          console.log("Goerli Contract : ", contractGoerli);

        } else if (chainId === 80001) {
          const contractMumbai = new ethers.Contract(REACT_APP_POLYGON_CONTRACT_ADDRESS, abiChild, childProvider);
          setContract(contractMumbai);
          console.log("Mumbai Contract : ", contractMumbai);
        }
      } catch (error) {
        console.error(error);
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  const initReloadOnChainChanged = () => {
    window.ethereum.on('chainChanged', (newChainId) => {
      if (newChainId && chainId !== parseInt(newChainId)) {
        setChainId(parseInt(newChainId));
        initContract();
      }
    });
  }

  const renderKoNftMigration = () => {
    if (signerAddress && contract && chainId) {
      return (
        <KoNftMigration
          chainId={chainId}
          provider={provider}
          signer={signer}
          signerAddress={signerAddress}
          contract={contract}
          maticJdkManager={maticJdkManager}
        />
      );
    }
  }

  return (
    <div className="App container">

      <h1 className={"mt-5"}>
        Token Migration Prototype
      </h1>

      <ConnectWeb3/>

      {renderKoNftMigration()}

    </div>
  );
}

export default App;
