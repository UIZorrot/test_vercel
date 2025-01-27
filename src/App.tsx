"use client";

import React, { useState, useEffect } from "react";
import "./app.css";
import { ethers } from "ethers";
import { Button } from "antd";
import * as fs from 'fs';
import ContractAbi from "./WOF.json";
import Rules from "./rules";

declare global {
  interface window { ethereum: any; }
}

export default function App() {
  const [account, setAccount] = useState<string | null>(null); // 钱包地址
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [cardsLeft, setCardsLeft] = useState(106); // 初始剩余牌数
  const [points, setPoints] = useState(0); // 玩家当前得分
  const [handCards, setHandCards] = useState<{ suit: string; num: string }[]>([]);
  const [drawPrice, setDrawPrice] = useState(0.01); // 初始抽牌价格
  const [prizePool, setPrizePool] = useState(0); // 奖池金额

  const contractAddress = "0x4c2fA6755CF13aBF4c30010E4519e98f76bFF29E";
  const monadRpcUrl = "https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a";

  const suits = ["♦️", "♠️", "♥️", "♣️", "🔺", "⭐", "⚡", "🌟"];
  const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const [showRules, setShowRules] = useState(false);

  const handleToggleF = () => {
    setShowRules(false);
  };

  const handleToggleT = () => {
    setShowRules(true);
  };

  // **初始化合约和钱包连接**
  const connectWallet = async () => {
    //@ts-ignore
    if (window.ethereum) {
      try {
        //@ts-ignore
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const accounts = await ethProvider.send("eth_requestAccounts", []);
        const contractInstance = new ethers.Contract(contractAddress, ContractAbi.abi, signer);

        setAccount(accounts[0].address);
        setProvider(ethProvider);
        setContract(contractInstance);
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.error("MetaMask not found. Please install MetaMask.");
    }
  };

  // **检测钱包是否已连接**
  const checkWalletConnection = async () => {
    //@ts-ignore
    if (window.ethereum) {
      try {
        //@ts-ignore
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.listAccounts();
        if (accounts.length > 0) {
          const signer = await ethProvider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, ContractAbi.abi, signer);

          //@ts-ignore
          setAccount(accounts[0].address);
          setProvider(ethProvider);
          setContract(contractInstance);
          console.log("Wallet already connected:", accounts[0]);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }
  };

  // **轮询获取合约状态**
  useEffect(() => {
    const fetchContractState = async () => {
      if (!contract) return;

      try {
        const cards = await contract.getTotalCardsLeft();
        const pool = await contract.getPrizePool();
        const playerHand = await contract.getPlayerHandInternal(account);
        const playerPoints = await contract.getPlayerScore(account);
        const currentDrawPrice = await contract.getCurrentDrawPrice(account);

        setCardsLeft(parseInt(cards));
        setPrizePool(parseFloat(ethers.formatEther(pool)));
        setPoints(parseInt(playerPoints));
        setDrawPrice(parseFloat(ethers.formatEther(currentDrawPrice)));

        // 解析玩家手牌
        const hand = playerHand.map((card) => {
          if (card < 3) {
            return { suit: "🎡", num: "0" }; // 命运之轮
          }
          const suit = suits[Math.floor((parseInt(card) - 3) / 13)];
          const num = numbers[(parseInt(card) - 3) % 13];
          return { suit, num };
        });
        setHandCards(hand);
      } catch (error) {
        console.error("Failed to fetch contract state:", error);
      }
    };

    // 每隔5秒轮询一次状态
    const interval = setInterval(fetchContractState, 5000);
    fetchContractState(); // 初次加载时立即执行
    return () => clearInterval(interval);
  }, [contract, account]);


  // **页面加载时检查钱包连接状态**
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // **抽牌函数**
  const drawCard = async () => {
    if (!contract || !account) return;

    try {
      const tx = await contract.drawCard({ value: ethers.parseEther(drawPrice.toString()) });
      await tx.wait(); // 等待交易完成
      console.log("Card drawn successfully!");
    } catch (error) {
      console.error("Failed to draw card:", error);
    }
  };

  return (
    <html>
      <body>
        <div className="app">
          <div className="header">
            <div className="logo" style={{ margin: 9 }}>🎡</div>
            <div className="nav" style={{ marginLeft: 10 }}>
              <button>WheelOfFortune</button>
              <button onClick={handleToggleF}>Main</button>
              <button onClick={handleToggleT}>Rules</button>
            </div>
            <div className="connect-button" style={{ marginRight: 20 }}>

              {!account ? (
                <Button type="primary" style={{ marginTop: 5 }} onClick={connectWallet}>
                  Connect Wallet
                </Button>
              ) : (
                <Button type="primary" style={{ marginTop: 5 }}>{account.slice(0, 6)}...{account.slice(-6)}</Button>
              )}
            </div>
          </div>



          {showRules ? (
            <Rules />
          ) : (
            <div style={{ width: "100%", justifyContent: "center", justifyItems: "center" }}>
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <div>PRIZE POOL</div>
                <div style={{ fontWeight: "bold", fontSize: "24px" }}>{prizePool} DMON</div>
              </div>

              <hr style={{ margin: "20px 0 0 0", width: 200, border: "1px solid #ccc" }} />

              <div className="content-container">
                <div className="left" style={{ marginBottom: 80, marginRight: 160 }}>
                  <div className="card-stack">
                    {[...Array(cardsLeft)].map((_, index) => (
                      <div key={index} className="card" style={{ fontSize: 50, zIndex: cardsLeft - index }}>
                        🎡
                      </div>
                    ))}
                  </div>
                </div>

                <div className="right" style={{ marginLeft: 0, marginRight: 80 }}>
                  <div style={{ marginTop: "40px" }}>
                    <div>Total Cards Drawn</div>
                    <div style={{ fontWeight: "bold", fontSize: "24px" }}>{106 - cardsLeft}</div>
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <div>Cards Left</div>
                    <div style={{ fontWeight: "bold", fontSize: "24px" }}>{cardsLeft}</div>
                  </div>

                  <div style={{ marginTop: "40px" }}>
                    <Button type="default" size="large" onClick={drawCard} disabled={handCards.length >= 5 || !account}>
                      DRAW {drawPrice.toFixed(2)} DMON
                    </Button>
                  </div>
                </div>
              </div>

              <hr style={{ marginTop: 50, marginBottom: 0, width: 200, border: "1px solid #ccc" }} />

              <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
                {handCards.length === 0 ? (
                  <p>你的手牌是空的，请点击按钮抽牌。</p>
                ) : (
                  handCards.map((card, index) => (
                    <button key={index} className="hand-card">
                      <div className="card-content">
                        <div className="card-suit">{card.suit}</div>
                        <div className="card-number">{card.num}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div style={{ marginTop: "40px", textAlign: "center" }}>
                <div>POINT</div>
                <div style={{ fontWeight: "bold", fontSize: "24px" }}>{points}</div>
              </div>
            </div>
          )}



        </div>
      </body>
    </html>
  );
}
