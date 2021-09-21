/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";

import {
  Box,
  Text,
  Heading,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";

import abi from "../utils/WavePortal.json";

export default function Home() {
  const toast = useToast();

  const [currAccount, setCurrentAccount] = useState();
  const [loading, setLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [waveText, setWaveText] = useState("");
  const [isRinkebyNetwork, setIsRinkebyNetwork] = useState(false);

  const contractAddress = "0x9BdD3617Af6780a9f33b57Fd853B4259a1857A51";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    const response = await waveportalContract.getAllWaves();

    const waves = response.map((wave) => ({
      address: wave.waver,
      timestamp: new Date(wave.timestamp * 1000),
      message: wave.message,
    }));

    setAllWaves(waves);

    waveportalContract.on("NewWave", (from, timestamp, message) => {
      setAllWaves((oldArray) => [
        ...oldArray,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    });
  };

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum objects", ethereum);
    }

    ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length !== 0) {
        const account = accounts[0];
        toast({
          title: "Wallet connected.",
          status: "success",
          duration: 9000,
          position: "top",
          isClosable: true,
        });

        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    });
  };

  const connectWallet = () => {
    const { ethereum } = window;

    if (!ethereum) alert("Get metamask!");

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        setCurrentAccount(accounts[0]);
        toast({
          title: "Wallet connected.",
          status: "success",
          duration: 9000,
          position: "top",
          isClosable: true,
        });
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    addChainListener();
  }, []);


  useEffect(() => {
    if (currAccount && isRinkebyNetwork) getAllWaves();
  }, [currAccount, isRinkebyNetwork]);

  const wave = async () => {
    try {
      if (!waveText) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const waveportalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const waveTxn = await waveportalContract.wave(waveText, {
        gasLimit: 300000,
      });
      setLoading(true);

      await waveTxn.wait();
      setLoading(false);
      setWaveText("");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  async function addChainListener() {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setIsRinkebyNetwork(chainId === "0x4");
      window.ethereum.on("chainChanged", async (chainId) => {
        setIsRinkebyNetwork(chainId === "0x4");
      });
    }
  }

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='center'
      height='100vh'
    >
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        flexDir='column'
        maxWidth='400px'
        w='400px'
      >
        <Heading>👋 Hey there!</Heading>

        <Text mt='4'>
          My name is Helder and I'm Software Developer. <br />
          Connect your Ethereum wallet and wave at me!
        </Text>

        {currAccount ? (
          <>
            {isRinkebyNetwork && (
              <Input
                value={waveText}
                onChange={(e) => setWaveText(e.target.value)}
                placeholder='Your message'
                mt='4'
              />
            )}
            <Button
              w='100%'
              mt='4'
              isLoading={loading}
              onClick={wave}
              disabled={!isRinkebyNetwork}
              colorScheme={isRinkebyNetwork ? "gray" : "red"}
            >
              {isRinkebyNetwork ? "Wave at Me" : "Wrong network"}
            </Button>
          </>
        ) : (
          <Button w='100%' mt='4' colorScheme='purple' onClick={connectWallet}>
            Connect wallet
          </Button>
        )}
        {allWaves.length > 0 && (
          <Table variant='simple' mt='4' size='sm'>
            <Thead>
              <Tr>
                <Th>Address</Th>
                <Th>Message</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {allWaves.map((wave, index) => (
                <Tr key={index}>
                  <Td>{wave.address.slice(0, 8)}...</Td>
                  <Td>{wave.message}</Td>
                  <Td>{wave.timestamp.toString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
