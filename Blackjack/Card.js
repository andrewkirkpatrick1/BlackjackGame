export class Card {
    constructor(suit, name){
        // suit: Hearts, Diamonds, Clubs, Spades
        // name: 2,3,4,...,10,Jack,Queen,King,Ace
        // val:  2,3,4,...,10,10,10,10,11

        // Suit contructor:
        if(typeof suit == 'number'){
            switch(suit){
                case 0: this.suit = "Hearts"; break;
                case 1: this.suit = "Diamonds"; break;
                case 2: this.suit = "Clubs"; break;
                case 3: this.suit = "Spades"; break;
            }
        }
        else this.suit = suit;

        // Name constructor:
        this.name = name;
        switch(name){
            case 11: this.name = 'Jack'; break;
            case 12: this.name = 'Queen'; break;
            case 13: this.name = 'King'; break;
            case 14: this.name = 'Ace'; break;
        }

        // Value constructor
        this.val = name;
        switch(name) {
            case 'Jack':
            case 'Queen':
            case 'King':
            case 11:
            case 12: 
            case 13: this.val = 10; break;
            case 'Ace':
            case 14: this.val = 11; break;
        }
    }

    equals(input){
        return  (this.suit == input.suit && this.name == input.name) ? true : false;
    }

    toString() {
        return this.name + ' of ' + this.suit;
    }

    getColor(){
        return (this.suit == "Hearts" || this.suit == "Diamonds") ? "redCard" : "blackCard";
    }
}