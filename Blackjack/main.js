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
    doubleDownButton.title = "Doubles your initial bet, but only adds one card";
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
    async function startGame(){

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

        await updateHandUI();

        await checkBlackjack();
    }

    // Game buttons (hit, stand, double down)
    // Hit button
    hitButton.addEventListener("click", async () => {
        if(!gameActive) return;

        doubleDownButton.style.display = "none";

        let newCard = deck.dealCard();
        player.addCard(newCard);

        await updateHandUI("player");

        // Check for bust
        if(player.valueOfHand() > 21) {
            endGame("Bust! Dealer Wins.", "loss");
        }
    });

    // Stand button
    standButton.addEventListener("click", async () => {
        if(!gameActive) return;

        gameActive = false;

        await revealDealerCardAnimation();

        // Dealer draws until hand value >= 17
        while(dealer.valueOfHand() < 17){
            let newCard = deck.dealCard();
            dealer.addCard(newCard);
            await updateHandUI("dealer");
        }

        // Win loss conditions
        checkWinLossConditions();
    });

    // Used in stand function to wait inside while loop
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Double down button
    doubleDownButton.addEventListener("click", async () => {
        player.money -= currentBet;
        currentBet *= 2;
        playerMoneyCounter.textContent = player.money;
        betAmountCounter.textContent = currentBet;

        // perform the 'hit' part of double-down (only one card)
        doubleDownButton.style.display = "none";
        let newCard = deck.dealCard();
        player.addCard(newCard);
        await updateHandUI("player");

        // if player busts immediately, finish
        if(player.valueOfHand() > 21) {
            endGame("Bust! Dealer Wins.", "loss");
            return;
        }

        // perform the 'stand' part: reveal dealer and resolve dealer draws
        gameActive = false;
        await revealDealerCardAnimation();

        while(dealer.valueOfHand() < 17){
            await delay(700);
            let newDealerCard = deck.dealCard();
            dealer.addCard(newDealerCard);
            await updateHandUI("dealer");
        }

        checkWinLossConditions();
    });

    function checkWinLossConditions() {
        if(dealer.valueOfHand() > 21)
            endGame("Dealer Bust! You Win!", "win");
        else if(player.valueOfHand() > dealer.valueOfHand())
            endGame("You Win!", "win");
        else if(player.valueOfHand() < dealer.valueOfHand())
            endGame("Dealer Wins.", "loss");
        else 
            endGame("Push, it's a tie.", "tie")
    }

    async function checkBlackjack() {
        if(player.valueOfHand() === 21 && dealer.valueOfHand() === 21) {
            // reveal dealer's hidden card first, then end as tie
            await revealDealerCardAnimation();
            await delay(500);
            endGame("Push, it's a tie.", "tie");
        }
        else if(dealer.valueOfHand() === 21) {
            // reveal dealer's hidden card first, then show loss
            await revealDealerCardAnimation();
            await delay(500);
            endGame("Dealer has blackjack, You lose.", "loss");
        }
        else if(player.valueOfHand() === 21) {
            endGame("Blackjack! You Win!", "blackjack");
        }
    }

    // Ends game
    async function endGame(message, outcome){
        await revealDealerCardAnimation();
        gameActive = false;
        await updateHandUI();

        // Update player's money
        if(outcome === "blackjack") player.money += parseInt(currentBet * 2.5);
        else if(outcome === "win") player.money += parseInt(currentBet * 2);
        else if(outcome === "tie") player.money += parseInt(currentBet);

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
        }, 1000);
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
    async function updateHandUI(dealCardTarget = null){

        if(dealCardTarget != null) {
            await moveCardsLeftAnimation(dealCardTarget);
        }

        playerCardsDiv.innerHTML = '';
        dealerCardsDiv.innerHTML = '';

        // Display dealer's cards
        dealer.hand.forEach((card, index) => {
            // Hide dealer's first card while game is active
            if(index == 0 && gameActive)
                dealerCardsDiv.appendChild(drawCard(card, true));
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
        else if (player.valueOfHand() <= 21){
            // if game is over and player has not bust, show dealer value
            dealerScoreSpan.textContent = dealer.valueOfHand();
        }

        // If card is being delt, do an animation
        if(dealCardTarget != null) {
            await dealCardAnimation(dealCardTarget);
        }
    }

    function revealDealerCardAnimation() {
        return new Promise((resolve) => {
            const hiddenDealerCard = dealerCardsDiv.querySelector('.card.flipped');
            if(!hiddenDealerCard) return resolve();
            const inner = hiddenDealerCard.querySelector('.card-inner');

            // if already revealed, just update score and resolve
            if(!hiddenDealerCard.classList.contains('flipped') || !inner) {
                dealerScoreSpan.textContent = dealer.valueOfHand();
                return resolve();
            }

            // listen for transition end on the inner element
            let revealed = false;
            const finishReveal = () => {
                if(revealed) return;
                revealed = true;
                clearTimeout(revealTimeoutId);
                dealerScoreSpan.textContent = dealer.valueOfHand();
                resolve();
            };

            const onTransition = (e) => {
                if(e.propertyName === 'transform') {
                    finishReveal();
                }
            };

            inner.addEventListener('transitionend', onTransition, { once: true });

            // fallback in case transitionend doesn't fire
            const revealTimeoutId = setTimeout(finishReveal, 800);

            hiddenDealerCard.classList.remove('flipped');
        });
    }

    function moveCardsLeftAnimation(target) {
        return new Promise((resolve) => {
            if(target != "player" && target != "dealer") {
                return resolve();
            }

            /* Move all cards to left */
            let cards = [];
            let numOfCards;
            if(target === 'player') {
                cards = playerCardsDiv.querySelectorAll(".card");
                numOfCards = player.hand.length - 1;
            }
            else if (target === 'dealer') {
                cards = dealerCardsDiv.querySelectorAll(".card");
                numOfCards = dealer.hand.length - 1;
            }

            if(numOfCards <= 0) {
                return resolve();
            }

            let translateCounter = 0;
            let resolved = false;
            const finish = () => {
                if(resolved) return;
                resolved = true;
                clearTimeout(timeoutId);
                resolve();
            };

            const onCardDeal = function(e) {
                if(e.propertyName === 'transform') {
                    translateCounter++;
                    if(translateCounter === numOfCards) {
                        finish();
                    }
                }
            }

            // fallback in case transitions don't fire
            const timeoutId = setTimeout(finish, 700);

            for(let card of cards) {
                card.classList.add('moved-left');
                card.addEventListener('transitionend', onCardDeal, { once: true })
            }
        });

    }

    function dealCardAnimation(target) {
        return new Promise((resolve) => {
            let handDiv = [];
            let handLeng;
            if(target === "player") {
                handDiv = playerCardsDiv.querySelectorAll(".card-inner");
                handLeng = player.hand.length - 1;
            }
            else if(target === "dealer") {
                handDiv = dealerCardsDiv.querySelectorAll(".card-inner");
                handLeng = dealer.hand.length - 1;
            }

            let cardDiv = handDiv[handLeng];
            if(!cardDiv) return resolve();
            cardDiv.classList.add('start-small');

            let resolved = false;
            const cleanup = () => {
                if(resolved) return;
                resolved = true;
                // temporarily disable transitions so removing the class doesn't trigger a transition
                const prevTransition = cardDiv.style.transition;
                cardDiv.style.transition = 'none';
                cardDiv.classList.remove('start-small');
                // force reflow to ensure the style change is applied
                void cardDiv.offsetWidth;
                // restore the inline transition after a short delay
                setTimeout(() => { cardDiv.style.transition = prevTransition || ''; }, 50);
                resolve();
            };

            const timeoutId = setTimeout(cleanup, 800);
            cardDiv.addEventListener("animationend", function endAnimation() {
                clearTimeout(timeoutId);
                cleanup();
            }, { once: true });
        });
    }

    // Creates the card visuals
    function drawCard(card, isHidden = false){
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";

        cardDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-top"></div>
                    <div class="card-center"></div>
                    <div class="card-bottom"></div>
                </div>
                <div class="card-back">
                    <div class="card-back-design"></div>
                </div>
            </div>
        `;

        if(card) {
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

            const topEl = cardDiv.querySelector('.card-top');
            const centerEl = cardDiv.querySelector('.card-center');
            const bottomEl = cardDiv.querySelector('.card-bottom');
            topEl.textContent = `${nameIcon}${suitIcon}`;
            centerEl.textContent = `${suitIcon}`;
            bottomEl.textContent = `${nameIcon}${suitIcon}`;
        }

        if(isHidden) {
            cardDiv.classList.add('flipped');
            cardDiv.title = '?';
        } else {
            cardDiv.classList.remove('flipped');
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
