/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {
  const [currAccount, setCurrentAccount] = React.useState()
  const [loading, setLoading] = React.useState(false)
  const [allWaves, setAllWaves] = React.useState([])
  const [waveText, setWaveText] = React.useState('')

  const contractAddress = "0x51fcab301967Aa88662DE3d66145410060Ec9A15"
  const contractABI = abi.abi

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer)

    const response = await waveportalContract.getAllWaves()

    const waves = response.map(wave => ({
      address: wave.waver,
      timestamp: new Date(wave.timestamp * 1000),
      message: wave.message
    }))

    console.log(waves)
    setAllWaves(waves)

    waveportalContract.on("NewWave", (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message)
      setAllWaves(oldArray => [...oldArray, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }])
    })
  }

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
        getAllWaves()
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

  const wave = async () => {
    if (!waveText) return
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer)

    let count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total wave count...", count.toNumber())

    const waveTxn = await waveportalContract.wave(waveText, { gasLimit: 300000 })
    setLoading(true)
    console.log("Mining...", waveTxn.hash)

    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash)
    setLoading(false)
    setWaveText('')

    count = await waveportalContract.getTotalWaves()
    console.log("Retreived total wave count...", count.toNumber())
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          My name is Helder and I'm Software Developer. <br/>
          Connect your Ethereum wallet and wave at me!
        </div>

        {currAccount ? (
          <>
            <input 
              className="waveInput" 
              value={waveText} 
              onChange={(e) => setWaveText(e.target.value)}
              placeholder="Your message"
            />

            <button disabled={loading} className="waveButton" onClick={wave}>
              {loading ? 'Sending wave...' : 'Wave at Me'}
            </button>
          </>
        ) : (
          <button className="waveButton" onClick={connectWallet}>
            Connect wallet
          </button>
        )}

        {allWaves.map((wave, index) => (
          <div key={index} style={{ backgroundColor: 'OldLace', marginTop: "16px", padding: "8px" }}>
            <div>Address: {wave.address}</div>
            <div>Time: {wave.timestamp.toString()}</div>
            <div>Message: {wave.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
