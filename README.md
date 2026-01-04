Overview:
This is a web-based Blackjack game implemented with HTML, CSS, and JavaScript. The game features card dealing, betting mechanics, and animations including falling poker chips and a card stream effect.

Quick Start:

Two easy ways to run locally:

Recommended (local static server):
  1. Open a terminal and change into the game's folder:
     ```bash
     cd Blackjack
     ```
  2. Start a simple server (Python):
     ```bash
     python3 -m http.server 8000
     ```
  3. Open your browser to: http://localhost:8000

- Quick (open file):
  - Double-click `Blackjack/index.html` or open it in your browser. (Note: some browsers restrict module imports when using the file:// protocol — using a local server avoids those issues.)

> Works in modern browsers (Chrome, Firefox, Safari). If cards or animations behave oddly, try running the server approach above and check the browser console for errors.


Features:

- Complete Blackjack Rules: Hit, stand, double down

- Betting System: Place bets before each round


Visual Effects:

- Falling poker chip background

- Animated card stream on title screen

- Card animations and hover effects


Game States:

- Title screen with animations

- Betting interface

- Gameplay screen

- Win/loss messages with animations

- Responsive Design: Adapts to different screen sizes


How to Play:

- Click "Start Game" on the title screen

- Place your bet using the betting interface:

- Enter a specific amount

- Use shortcuts: Max Bet, Half Bet, Clear Bet


Gameplay:

- Hit: Take another card

- Stand: Keep your current hand

- Double Down: Double your bet and take one more card


JavaScript Classes:

- Card.js: Creates cards used in gameplay

- Deck.js: Manages card deck creation, shuffling, and dealing

- Player.js: Handles player/dealer actions and hand management


Visual Elements:

- Animated Cards: Cards display with suit/rank

- Poker Chips: Falling chips with different values

- Game UI: Layout with intuitive controls


Credits:

- Poker chip CSS from CodePen

- Blank card design from PrintCSS
