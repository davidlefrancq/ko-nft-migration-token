import {useState, useEffect} from 'react'
import {ethers} from 'ethers'
import {GrNetwork, IoWalletSharp} from "react-icons/all";

export default function ConnectWeb3() {

  const [addressSigner, setAddressSigner] = useState("0x00")
  const [network, setNetwork] = useState({})

  useEffect(() => {

    window.ethereum.on('chainChanged', (newChainId) => {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      provider.getNetwork().then((result) => {
        setNetwork(result);
        connectWeb3Fn();
      });
    });

    const connectWeb3Fn = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({method: 'eth_requestAccounts'})

          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const signer = provider.getSigner()

          provider.getNetwork().then((result) => {
            setNetwork(result);
          });

          setAddressSigner(await signer.getAddress())

          // window.ethereum.on('accountsChanged', (accounts) => {
          //   connectWeb3Fn();
          // });

        } catch (err) {
          console.error(err)
        }
      } else {
        alert("Install Metamask")
      }
    }

    connectWeb3Fn()


  }, [])

  return (
    <div>
      <div>
        <span className={"me-1"}>
          <GrNetwork size={18}/>
        </span>
        {network && network.name ? network.name.toUpperCase() : ""}
      </div>
      <div>
        <span className={"me-1"}>
          <IoWalletSharp size={18}/>
        </span>
        {addressSigner}
      </div>
    </div>
  )
}
