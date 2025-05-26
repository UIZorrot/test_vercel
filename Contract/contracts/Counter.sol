// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WOF {
    struct Player {
        uint256 score;
        uint256 cardCount;
        uint256 drawPrice;
        uint256[] handCards;
        bool hasWheelOfFortune;
    }

    struct WinnerInfo {
        address player;
        uint256 score;
        uint256 amountWon;
    }

    mapping(address => Player) public players;
    mapping(uint256 => bool) public drawnCards; // 记录是否已抽取某张牌
    uint256 public prizePool;
    uint256 public totalCards = 106; // 总牌数
    uint256 public baseDrawPrice = 0.01 ether; // 初始抽牌价格
    address public constant feeRecipient = 0x26202f062912f183B0D7aeE8fBB76B67354aEAe1;

    address[] public wheelOfFortuneWinners; // 记录命运之轮的获胜者
    WinnerInfo[] public lastRoundWinners; // 记录上一轮的获胜者信息

    event CardDrawn(address indexed player, uint256 card, uint256 newScore);
    event WheelOfFortuneWon(address indexed player, uint256 prize);
    event PrizePoolDistributed(uint256 nextRound, uint256 winnerPrize, uint256 highestScorePrize, uint256 fee);

    constructor() {
        prizePool = 0 ether; // 初始化奖金池
    }

    // 抽牌函数
    function drawCard() public payable {
        Player storage player = players[msg.sender];

        require(player.cardCount < 5, "Maximum 5 cards allowed");
        require(msg.value >= player.drawPrice, "Insufficient payment");

        // 抽牌资金进入奖池
        prizePool += msg.value;

        // 获取未抽取的随机牌
        uint256 newCard = _getRandomCard(msg.sender);
        player.handCards.push(newCard);
        player.cardCount++;
        totalCards--;

        if (newCard < 3) { // **命运之轮 🎡 的编号为 0, 1, 2**
            player.hasWheelOfFortune = true;
            wheelOfFortuneWinners.push(msg.sender);
            emit WheelOfFortuneWon(msg.sender, (prizePool * 30) / 100);
        } else {
            // 更新分数
            player.score = _calculateScore(player.handCards);
        }

        // 更新抽牌价格
        player.drawPrice = player.cardCount > 1 ? player.drawPrice * 2 : baseDrawPrice;

        emit CardDrawn(msg.sender, newCard, player.score);

        // 如果牌抽完了，自动触发奖金池分配
        if (totalCards == 0) {
            distributePrizePool();
        }
    }

    // 奖池分配函数
    function distributePrizePool() private {
        require(totalCards == 0, "Game not finished yet");

        uint256 nextRoundPool = (prizePool * 30) / 100;
        uint256 winnerPrize = (prizePool * 30) / 100;
        uint256 highestScorerPrize = (prizePool * 30) / 100;
        uint256 fee = (prizePool * 10) / 100;

        // 清空上一轮的获胜者记录
        delete lastRoundWinners;

        // 防止重入攻击，先修改状态变量
        prizePool = nextRoundPool;

        // 分配奖金给命运之轮获胜者
        for (uint256 i = 0; i < wheelOfFortuneWinners.length; i++) {
            address winner = wheelOfFortuneWinners[i];
            uint256 individualPrize = winnerPrize / wheelOfFortuneWinners.length;

            payable(winner).transfer(individualPrize);
            lastRoundWinners.push(WinnerInfo(winner, players[winner].score, individualPrize));
        }

        // 分配奖金给分数最高者
        address highestScorer = getHighestScorer();
        if (highestScorer != address(0)) {
            payable(highestScorer).transfer(highestScorerPrize);
            lastRoundWinners.push(WinnerInfo(highestScorer, players[highestScorer].score, highestScorerPrize));
        }

        // 分配抽水
        payable(feeRecipient).transfer(fee);

        // 重置游戏状态
        resetGame();

        emit PrizePoolDistributed(nextRoundPool, winnerPrize, highestScorerPrize, fee);
    }

    // 重置游戏状态
    function resetGame() internal {
        for (uint256 i = 0; i < 107; i++) {
            drawnCards[i] = false; // 重置所有牌为未抽取状态
        }
        totalCards = 106;
        delete wheelOfFortuneWinners; // 清空命运之轮获胜者记录
    }

    // 获取最高得分玩家
    function getHighestScorer() private view returns (address) {
        address highest = address(0);
        uint256 highestScore = 0;

        for (uint256 i = 0; i < wheelOfFortuneWinners.length; i++) {
            address player = wheelOfFortuneWinners[i];
            if (players[player].score > highestScore) {
                highestScore = players[player].score;
                highest = player;
            }
        }

        return highest;
    }


    // 计算分数
    function _calculateScore(uint256[] memory cards) private pure returns (uint256) {
        uint256 score = 0;
        uint256[13] memory numCount;
        uint256[8] memory suitCount;
        uint256[] memory numArray = new uint256[](cards.length);

        for (uint256 i = 0; i < cards.length; i++) {
            if (cards[i] < 3) {
                continue; // 忽略命运之轮
            }
            uint256 num = (cards[i] - 3) % 13; // 获取数字 0-12
            uint256 suit = (cards[i] - 3) / 13; // 获取花色 0-7
            numCount[num]++;
            suitCount[suit]++;
            numArray[i] = num == 0 ? 14 : num + 1; // A 视为 14 分
            score += numArray[i]; // 加入牌面本身分数
        }

        // 对子分数计算
        for (uint256 i = 0; i < 13; i++) {
            if (numCount[i] == 2) {
                score += 10 + (i + 1);
            } else if (numCount[i] == 3) {
                score += 20 + (i + 1) * 2;
            } else if (numCount[i] == 4) {
                score += 40 + (i + 1) * 3;
            } else if (numCount[i] == 5) {
                score += 80 + (i + 1) * 4;
            }
        }

        // 同花分数计算
        for (uint256 i = 0; i < 8; i++) {
            if (suitCount[i] == 2) {
                score += 10;
            } else if (suitCount[i] == 3) {
                score += 20;
            } else if (suitCount[i] == 4) {
                score += 40;
            } else if (suitCount[i] == 5) {
                score += 80;
            }
        }

        // 顺子分数计算
        _sortArray(numArray);
        uint256 straightCount = 1;
        for (uint256 i = 1; i < numArray.length; i++) {
            if (numArray[i] == numArray[i - 1] + 1) {
                straightCount++;
                if (straightCount == 3) {
                    score += 20;
                } else if (straightCount == 4) {
                    score += 40;
                } else if (straightCount == 5) {
                    score += 80;
                }
            } else {
                straightCount = 1;
            }
        }

        return score;
    }

    // 工具函数：对数组排序
    function _sortArray(uint256[] memory array) private pure {
        for (uint256 i = 0; i < array.length; i++) {
            for (uint256 j = i + 1; j < array.length; j++) {
                if (array[i] > array[j]) {
                    uint256 temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }
        }
    }

    // View 查询函数：上一轮的获胜者及其信息
    function getLastRoundWinners() public view returns (WinnerInfo[] memory) {
        return lastRoundWinners;
    }

    // 获取随机未抽取的牌
    function _getRandomCard(address user) private returns (uint256) {
        require(totalCards > 0, "No cards left to draw");

        uint256 randomCard;
        do {
            randomCard = uint256(keccak256(abi.encodePacked(block.timestamp, user, totalCards))) % 107;
            if (!drawnCards[randomCard]) {
                break;
            }
            randomCard = (randomCard + 1) % 107; // 顺序查找最近的未抽取牌
        } while (true);

        drawnCards[randomCard] = true; // 标记为已抽取
        return randomCard;
    }

    // View 查询函数：展示手牌
    function getPlayerHand(address player) public view returns (string[] memory) {
        Player storage p = players[player];
        string[] memory handDescriptions = new string[](p.handCards.length);

        for (uint256 i = 0; i < p.handCards.length; i++) {
            handDescriptions[i] = _getCardDescription(p.handCards[i]);
        }
        return handDescriptions;
    }

    // 生成卡牌描述
    function _getCardDescription(uint256 card) private pure returns (string memory) {
        string[8] memory suits = ["Diamonds", "Spades", "Hearts", "Clubs", "Triangles", "Stars", "Lightning", "Starlight"];
        string[13] memory numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

        if (card < 3) {
            return "Wheel of Fortune";
        }

        uint256 suitIndex = (card - 3) / 13;
        uint256 numberIndex = (card - 3) % 13;
        return string(abi.encodePacked(suits[suitIndex], " ", numbers[numberIndex]));
    }


    // **View 查询函数**
    function getPlayerHandInternal(address player) public view returns (uint256[] memory) {
        return players[player].handCards;
    }

    function getPlayerScore(address player) public view returns (uint256) {
        return players[player].score;
    }

    function getCurrentDrawPrice(address player) public view returns (uint256) {
        return players[player].drawPrice;
    }

    function getTotalCardsLeft() public view returns (uint256) {
        return totalCards;
    }

    function getPrizePool() public view returns (uint256) {
        return prizePool;
    }

}
