import * as React from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {
  const [currAccount, setCurrentAccount] = React.useState()

  console.log(currAccount)

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } else {
      console.log("We have the ethereum objects", ethereum)
    }

    ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log("Found an authrozied account: ", account)

        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window

    if (!ethereum) alert("Get metamask!")

    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.error(err))
  }

  React.useEffect(() => {
    checkIfWalletIsConnected()
  },[])

  const wave = () => {
    
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect wallet
          </button>
        )}
      </div>
    </div>
  );
}
