import {Deck} from './Deck.js';
import {Player} from './Player.js';

document.addEventListener('DOMContentLoaded', () => {
    // Title
    const chipBackground = document.querySelector(".chip-background");
    const titleContainer = document.getElementById("title-container");
    const title = document.getElementById("title");
    const cardStreamDiv = document.getElementById("card-stream");
    const startButton = document.getElementById("start-button");

    // Betting
    const bettingOverlay = document.getElementById("betting-overlay");
    const placeBetButton = document.getElementById("place-bet-button");
    const maxBetButton = document.getElementById("max-bet-button");
    const halfBetButton = document.getElementById("half-bet-button");
    const clearBetButton = document.getElementById("clear-bet-button");
    const playerMoneySpan = document.getElementById("player-money");
    const currentBetInput = document.getElementById("bet-amount");
    const betMessage = document.getElementById("bet-message");
    const betAmountCounter = document.getElementById("bet-amount-counter");
    const playerMoneyCounter = document.getElementById("player-money-counter");

    // Game Container
    const gameContainer = document.getElementById("game-container");
    const playerCardsDiv = document.getElementById("player-cards");
    const dealerCardsDiv = document.getElementById("dealer-cards");
    const playerScoreSpan = document.getElementById("player-score");
    const dealerScoreSpan = document.getElementById("dealer-score");
    const controls = document.getElementById("controls");
    const hitButton = document.getElementById("hit-button");
    const standButton = document.getElementById("stand-button");
    const doubleDownButton = document.getElementById("double-down");
    const endGameMessage = document.getElementById("end-game-message");
    hitButton.title = "Adds another card to your deck";
    doubleDownButton.title = "Doubles your intial bet, but only adds one card";
    standButton.title = "Keeps your current hand, ends your turn for the round";

    // Variables
    let deck, player, dealer;
    player = new Player("player");
    dealer = new Player("dealer");
    player.money = 1000;
    let currentBet = 0;
    let gameActive = false;
    let lastBet = "clear";
    let cardStreamDeck = new Deck();
    let spawnTimeoutId = null;
    cardStreamDeck.shuffle();

    createFallingChipsBackground();
    initializeCardStream();
    startButton.addEventListener("click", showBettingScreen);
        
    /* Gameplay */

    // Starts game
    function startGame(){

        deck = new Deck();
        deck.shuffle();
        player.clearHand();
        dealer.clearHand();

        // Deal cards
        player.dealHand(deck);
        dealer.dealHand(deck);

        // Show game UI
        gameContainer.style.display = "block";
        controls.style.display = "flex";
        endGameMessage.style.display = "none";
        gameActive = true;

        updateUI();

        if(player.valueOfHand() === 21 && dealer.valueOfHand() === 21)
            endGame("Push, it's a tie.", "tie");
        else if(dealer.valueOfHand() === 21)
            endGame("Dealer has blackjack, You lose.", "loss");
        else if(player.valueOfHand() === 21) 
            endGame("Blackjack! You Win!", "blackjack");
    }

    // Game buttons (hit, stand, double down)
    // Hit button
    hitButton.addEventListener("click", () => {
        if(!gameActive) return;

        player.addCard(deck);
        doubleDownButton.style.display = "none";
        updateUI();

        // Check for bust
        if(player.valueOfHand() > 21)
            endGame("Bust! Dealer Wins.", "loss");
    });

    // Stand button
    standButton.addEventListener("click", async () => {
        if(!gameActive) return;

        gameActive = false;
        updateUI();

        // Dealer draws until hand value >= 17
        while(dealer.valueOfHand() < 17){
            await delay(1000);
            dealer.addCard(deck);
            updateUI();
        }

        await delay(500);
        // Win loss conditions
        if(dealer.valueOfHand() > 21)
            endGame("Dealer Bust! You Win!", "win");
        else if(player.valueOfHand() > dealer.valueOfHand())
            endGame("You Win!", "win");
        else if(player.valueOfHand() < dealer.valueOfHand())
            endGame("Dealer Wins.", "loss");
        else 
            endGame("Push, it's a tie.", "tie")
    });

    // Used in stand function to wait inside while loop
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Double down button
    doubleDownButton.addEventListener("click", () => {
        player.money -= currentBet;
        currentBet *= 2;
        playerMoneyCounter.textContent = player.money;
        betAmountCounter.textContent = currentBet;
        hitButton.click();
        standButton.click();
    });

    // Ends game
    function endGame(message, outcome){
        gameActive = false;

        // Update player's money
        if(outcome === "blackjack") player.money += parseInt(currentBet * 2.5);
        else if(outcome === "win") player.money += parseInt(currentBet * 2);
        else if(outcome === "tie") player.money += parseInt(currentBet);

        updateUI();

        setTimeout(() => {
            controls.style.display = "none";
            endGameMessage.textContent = "";
            endGameMessage.style.display = "block";
            endGameMessage.classList.remove("blackjack", "win", "tie", "loss");

            titleContainer.style.display = "block";
            title.style.display = "none";
            if(player.money <= 0){
                endGameMessage.textContent = "You have lost all of your money.";
                endGameMessage.classList.add(outcome);
                player = new Player("player");
                dealer = new Player("dealer");
                player.money = 1000;
                currentBet = 0;
                startButton.style.display = "block";
                startButton.textContent = "Start Over";
            }
            else {
                endGameMessage.textContent = message;
                endGameMessage.classList.add(outcome);
                startButton.style.display = "block";
                startButton.textContent = "Play Again";
            }
        }, 500);
    }


    /* Betting */

    // Show betting screen
    function showBettingScreen() {
        // Show betting screen
        titleContainer.style.display = "none";
        cardStreamDiv.style.display = "none";
        gameContainer.style.display = "block";
        bettingOverlay.classList.add("active");
        playerMoneySpan.textContent = `${player.money}`;
        if(lastBet === "max") 
            currentBetInput.value = parseInt(player.money);
        else if(lastBet === "half")
            currentBetInput.value = parseInt(player.money / 2);
    }

    // Betting buttons (place, max, half, clear)
    // Place bet button
    placeBetButton.addEventListener("click", () => {
        let bet = parseInt(currentBetInput.value);

        playerMoneySpan.textContent = player.money;

        if(isNaN(bet) || bet <= 0) {
            betMessage.textContent = "Please enter a higher bet";
            return;
        }
        if(bet > player.money){
            betMessage.textContent = "You dont have enough money for this bet";
            return;
        }

        currentBet = parseInt(bet);
        if(player.money >= currentBet * 2) 
            doubleDownButton.style.display = "block";
        else 
            doubleDownButton.style.display = "none";

        if(currentBet === player.money)
            lastBet = "max";
        else if(currentBet === parseInt(player.money / 2))
            lastBet = "half"
        else 
            lastBet = "clear";

        player.money -= currentBet;

        playerMoneyCounter.textContent = player.money;
        betAmountCounter.textContent = currentBet;
        bettingOverlay.classList.remove("active");

        startGame();
    });

    // Max bet button
    maxBetButton.addEventListener("click", () => {
        currentBetInput.value = player.money;
        lastBet = "max";
    });

    // Half bet button
    halfBetButton.addEventListener("click", () => {
        currentBetInput.value = parseInt(player.money / 2);
        lastBet = "half";
    });

    // Clear bet button
    clearBetButton.addEventListener("click", () => {
        currentBetInput.value = 0;
        betMessage.textContent = "";
        lastBet = "clear";
    });


    /* Visuals */

    // Updates UI
    function updateUI(){
        playerCardsDiv.innerHTML = '';
        dealerCardsDiv.innerHTML = '';

        // Display dealer's cards
        dealer.hand.forEach((card, index) => {
            // Hide dealer's first card until game ends
            if(index == 0 && gameActive)
                dealerCardsDiv.appendChild(drawCard(null, true));
            else
                dealerCardsDiv.appendChild(drawCard(card));
        });

        // Display player's cards
        player.hand.forEach(card => {
            playerCardsDiv.appendChild(drawCard(card));
        });

        // Update scores
        playerScoreSpan.textContent = player.valueOfHand();

        if(gameActive) {
            // Show only dealer's visible card value
            if(dealer.hand.length > 1){
                const visibleScore = dealer.hand[1].val;
                dealerScoreSpan.textContent = `? + ${visibleScore}`;
            } 
            else {
                dealerScoreSpan.textContent = "?";
            }
        }
        else {
            dealerScoreSpan.textContent = dealer.valueOfHand();
        }

    }

    // Creates the card visuals
    function drawCard(card, isHidden = false){
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";

        if(isHidden) {
            cardDiv.title = "Blank Card";
            cardDiv.innerHTML = `
            <div class ="blank-card"></div>
            `;

        } else if(card) {
            const color = card.getColor();
            cardDiv.classList.add(color);
            cardDiv.title = card.toString();
            
            let suitIcon;
            switch(card.suit){
                case "Hearts": suitIcon = "♥"; break;
                case "Diamonds": suitIcon = "♦"; break;
                case "Clubs": suitIcon = "♣"; break;
                case "Spades": suitIcon = "♠"; break;
            }

            let nameIcon = card.name;
            switch(nameIcon){
                case "Jack": nameIcon = "J"; break;
                case "Queen": nameIcon = "Q"; break;
                case "King": nameIcon = "K"; break;
                case "Ace": nameIcon = "A"; break;
            }

            cardDiv.innerHTML = `
            <div class="card-top">${nameIcon}${suitIcon}</div>
            <div class="card-center">${suitIcon}</div>
            <div class="card-bottom">${nameIcon}${suitIcon}</div>
            `;
        }

        return cardDiv;
    }

    function createFallingChipsBackground(){
        const chipColors = ["white", "red", "blue", "green", "black"];
        const numChips = 20;

        for(let i = 0; i < numChips; i++){
            const chip = document.createElement("div");
            chip.classList.add("pokerchip");
            chip.classList.add(chipColors[Math.floor(Math.random() * chipColors.length)]);

            const startX = Math.random() * (window.innerWidth - 50);
            chip.style.left = `${startX}px`;

            const duration = 3 + Math.random() * 4; // Between 3 and 7 seconds
            chip.style.animationDuration = `${duration}s`;

            const rotationDirection = Math.random() > 0.5 ? "normal" : "reverse";
            chip.style.animationDirection = rotationDirection;

            chipBackground.appendChild(chip);

            chip.addEventListener("animationend", () => {
                chip.remove();
                createFallingChipsBackground();
            });
        }
    }

    function initializeCardStream() {
        stopAndClearCards();
        let numOfCards = 10;
        let intialDely = 700;
        for(let i = 0; i < numOfCards; i++)
            createCardStreamCard(i * intialDely);
    }

    function createCardStreamCard(delay) {
        if(cardStreamDeck.isEmpty())
            cardStreamDeck.shuffle();

        const card = cardStreamDeck.dealCard();
        const cardDiv = drawCard(card);
        cardDiv.classList.add("stream-card");
        cardDiv.style.animationDelay = `${delay}ms`;

        spawnTimeoutId = setTimeout(() => {
            cardStreamDiv.appendChild(cardDiv);
        }, 0);

        cardDiv.addEventListener("animationend", () => {
            cardDiv.remove();
            createCardStreamCard(0);
        }, { once: true });
    }

    function stopAndClearCards() {
        if(spawnTimeoutId) {
            clearTimeout(spawnTimeoutId);
            spawnTimeoutId = null;
        }

        while (cardStreamDiv.firstChild)
            cardStreamDiv.removeChild(cardStreamDiv.firstChild);
    }

    document.addEventListener("visibilitychange", () => {
        if(document.visibilityState === "visible"){
            initializeCardStream();
        }
        else {
            stopAndClearCards();
        }
    });
})