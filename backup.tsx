"use client";

import React, { useState, useEffect } from 'react';
import './app.css';
import ConnectButton from './ConnectButton';
import { Button } from "antd";

export default function App() {
    const [account, setAccount] = useState<string | null>(null);
    const [networkChanged, setNetworkChanged] = useState(false);

    // Monad Devnet网络信息
    const monadNetwork = {
        chainId: '20143',
        rpcUrl: 'https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a',
        chainName: 'Monad Devnet',
        nativeCurrency: { name: 'DMON', symbol: 'DMON', decimals: 18 },
        blockExplorerUrl: 'https://monad-networks.vercel.app/',
    };

    const [cardsLeft, setCardsLeft] = useState(106); // 初始剩余牌数（8花色*13 + 3命运之轮 = 107）
    const [points, setPoints] = useState(0); // 初始得分
    const [handCards, setHandCards] = useState<{ suit: string, num: string }[]>([]);
    const [drawnCards, setDrawnCards] = useState(new Set()); // 存储已抽的牌
    const [drawPrice, setDrawPrice] = useState(0.01); // 初始抽牌价格

    const suits = ['♦️', '♠️', '♥️', '♣️', '🔺', '⭐', '⚡', '🌟']; // 8 种花色
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; // 13 张普通牌
    const destinyCards = ['🎡', '🎡', '🎡']; // 3 张命运之轮牌

    // 组合完整牌库（8x13 + 3 = 107 张牌）
    const allCards = [
        ...suits.flatMap(suit => numbers.map(num => ({ suit, num }))),
        ...destinyCards.map(card => ({ suit: card, num: '0' })),
    ];

    const drawCard = () => {
        if (handCards.length >= 5) return; // 最多只能抽 5 张牌

        // 过滤掉已经抽过的牌
        const availableCards = allCards.filter(card => !drawnCards.has(${card.suit}-${card.num}));
        if (availableCards.length === 0) return; // 没有可抽的牌了

        // 随机选择一张未抽取的牌
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const newCard = availableCards[randomIndex];

        // 更新手牌和已抽取的牌
        setHandCards([...handCards, newCard]);
        setDrawnCards(new Set([...drawnCards, ${newCard.suit}-${newCard.num}]));
        setCardsLeft(prev => prev - 1); // 剩余牌数减少
        setPoints(calculateScore([...handCards, newCard]));

        // **价格翻倍，从第二张开始**
        if ([...handCards, newCard].length > 1) {
            setDrawPrice(prev => prev * 2);
        }
    };

    const calculateScore = (hand: { suit: string, num: string }[]) => {
        let score = 0;
        const suitCount: Record<string, number> = {};
        const numCount: Record<string, number> = {};
        const numArray: number[] = [];

        hand.forEach(({ suit, num }) => {
            if (suit === '🎡') return; // 命运之轮不计分

            // 统计花色和数字的出现次数
            suitCount[suit] = (suitCount[suit] || 0) + 1;
            numCount[num] = (numCount[num] || 0) + 1;
            numArray.push(numbers.indexOf(num) + 1); // **牌面大小要算分**
        });

        // **同花 (Flush) 计算**
        Object.values(suitCount).forEach(count => {
            if (count === 2) score += 10;
            else if (count === 3) score += 20;
            else if (count === 4) score += 40;
            else if (count === 5) score += 80;
        });

        // **对子 (Pairs) 计算**
        Object.values(numCount).forEach(count => {
            if (count === 2) score += 10;
            else if (count === 3) score += 20;
            else if (count === 4) score += 40;
            else if (count === 5) score += 80;
        });

        // **顺子 (Straight) 计算**
        numArray.sort((a, b) => a - b);
        let straightCount = 1;
        for (let i = 1; i < numArray.length; i++) {
            if (numArray[i] === numArray[i - 1] + 1) {
                straightCount++;
            } else {
                straightCount = 1;
            }
            if (straightCount === 3) score += 20;
            else if (straightCount === 4) score += 40;
            else if (straightCount === 5) score += 80;
        }

        // **牌面大小得分**
        score += numArray.reduce((sum, value) => sum + value, 0);

        return score;
    };

    const CardStack = ({ cardsLeft }: { cardsLeft: number }) => {
        const totalCards = 6;

        return (
            <div className="card-stack">
                {[...Array(totalCards)].map((_, index) => (
                    <div key={index} className="card" style={{ fontSize: 50, zIndex: totalCards - index }}>
                        🎡
                    </div>
                ))}
            </div>
        );
    };

    const HandCards = () => {
        return (
            <div style={{ marginTop: '40px', display: 'flex', gap: '10px' }}>
                {handCards.length === 0 ? (
                    <p>你的手牌是空的，请点击按钮抽牌。</p>
                ) : (
                    handCards.map((card, index) => (
                        <button key={index} className="hand-card">
                            <div className="card-content">
                                <div className="card-suit">{card.suit}</div> {/* 花色 */}
                                <div className="card-number">{card.num}</div> {/* 数字 */}
                            </div>
                        </button>
                    ))
                )}
            </div>
        );
    };

    return (
        <html>
          <body>
            <div className="app">
              <div className="header">
                <div className="logo" style={{ margin: 9 }}> 🎡</div>
                <div className="nav" style={{ marginLeft: 10 }}>
                  <button>WheelOfFortune</button>
                  <button>Main</button>
                  <button>Rules</button>
                </div>
                <div className="connect-button" style={{ marginRight: 20 }}>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <div>PRIZE POOL</div>
                <div style={{ fontWeight: 'bold', fontSize: '24px' }}>343691.3693$</div>
              </div>
    
              <hr style={{ margin: '20px 0 0 0', width: 200, border: '1px solid #ccc' }} />
    
              <div className="content-container">
                <div className="left" style={{ marginBottom: 80, marginRight: 160 }}>
                  <CardStack cardsLeft={8} />
                </div>
    
                <div className="right" style={{ marginLeft: 0, marginRight: 80 }}>
                  <div style={{ marginTop: '40px' }}>
                    <div>Total Cards Drawn</div>
                    <div style={{ fontWeight: 'bold', fontSize: '24px' }}>{drawnCards.size}</div>
                  </div>
    
                  <div style={{ marginTop: '20px' }}>
                    <div>Cards Left</div>
                    <div style={{ fontWeight: 'bold', fontSize: '24px' }}>{cardsLeft}</div>
                  </div>
    
                  <div style={{ marginTop: '40px' }}>
                    <Button color="default" variant="outlined" size='large' onClick={drawCard} disabled={handCards.length >= 5}>
                      DRAW 0.01 DMON
                    </Button>
                  </div>
                </div>
              </div>
    
              <hr style={{ marginTop: 50, marginBottom: 0, width: 200, border: '1px solid #ccc' }} />
    
              <HandCards />
    
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <div>POINT</div>
                <div style={{ fontWeight: 'bold', fontSize: '24px' }}>{points}</div>
              </div>
            </div>
          </body>
        </html>
      );
}