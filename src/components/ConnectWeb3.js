import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function ConnectWeb3() {

  const [addressSigner, setAddressSigner] = useState("0x00")

  useEffect(() => {
    const connectWeb3Fn = async () => {
      if(window.ethereum) {
        try {
          await window.ethereum.request({method: 'eth_requestAccounts'})

          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const signer = provider.getSigner()

          setAddressSigner(await signer.getAddress())

          window.ethereum.on('accountsChanged', (accounts)=>{
            connectWeb3Fn();
          });

        } catch (err) {
          console.error(err)
        }
      } else {
        alert("Install Metamask")
      }
    }

    connectWeb3Fn()


  }, [])

  return <div>Wallet : {addressSigner}</div>
}
